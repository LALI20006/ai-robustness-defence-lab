import os
import uuid
import json
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.dataset import Dataset
from backend.app.schemas.dataset import DatasetOut, DatasetPreview, DatasetStats, TargetSelectRequest
from backend.app.security.dependencies import get_current_user
from backend.app.ml.preprocessing.preprocessor import inspect_dataset_preview, compute_dataset_statistics, load_dataframe

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

ALLOWED_EXTENSIONS = {".csv", ".tsv", ".parquet"}

@router.post("/upload", response_model=DatasetOut, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    dataset_name: Optional[str] = Form(None),
    target_column: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Only safe tabular formats ({', '.join(ALLOWED_EXTENSIONS)}) are permitted."
        )

    # Read content and check size
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_MB} MB."
        )

    # Generate safe unique filename
    safe_name = f"dataset_{uuid.uuid4().hex[:12]}_{os.path.basename(file.filename)}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Inspect CSV structure
    try:
        preview = inspect_dataset_preview(file_path)
        stats = compute_dataset_statistics(file_path, target_col=target_column or preview.get("target_column"))
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse tabular dataset: {str(e)}")

    name = dataset_name.strip() if dataset_name else os.path.splitext(file.filename)[0]
    assigned_target = target_column or preview.get("target_column")

    dataset = Dataset(
        user_id=current_user.id,
        name=name,
        file_path=file_path,
        dataset_type="user_upload",
        target_column=assigned_target,
        rows_count=preview["total_rows"],
        columns_count=preview["total_columns"],
        feature_summary_json=json.dumps(stats["columns_stats"]),
        classes_json=json.dumps(list(stats["class_distribution"].keys()))
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return DatasetOut(
        id=dataset.id,
        name=dataset.name,
        dataset_type=dataset.dataset_type,
        target_column=dataset.target_column,
        rows_count=dataset.rows_count,
        columns_count=dataset.columns_count,
        classes=json.loads(dataset.classes_json) if dataset.classes_json else [],
        created_at=dataset.created_at
    )

@router.post("/load-sample", response_model=DatasetOut)
def load_sample_dataset(
    sample_type: str = "network", # "network" or "malware"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if sample_type == "malware":
        filename = "malware_pe_features_sample.csv"
        ds_name = "PE Malware Features Sample"
        target_col = "label"
    else:
        filename = "nsl_kdd_intrusion_sample.csv"
        ds_name = "NSL-KDD Network Intrusion Sample"
        target_col = "label"

    sample_path = os.path.join(settings.SAMPLE_DIR, filename)
    if not os.path.exists(sample_path):
        from backend.scripts.generate_sample_data import generate_sample_datasets
        generate_sample_datasets()

    # Check if already added
    existing = db.query(Dataset).filter(
        Dataset.user_id == current_user.id,
        Dataset.name == ds_name
    ).first()
    if existing:
        return DatasetOut(
            id=existing.id,
            name=existing.name,
            dataset_type=existing.dataset_type,
            target_column=existing.target_column,
            rows_count=existing.rows_count,
            columns_count=existing.columns_count,
            classes=json.loads(existing.classes_json) if existing.classes_json else [],
            created_at=existing.created_at
        )

    stats = compute_dataset_statistics(sample_path, target_col=target_col)
    df = pd.read_csv(sample_path)

    dataset = Dataset(
        user_id=current_user.id,
        name=ds_name,
        file_path=sample_path,
        dataset_type=f"sample_{sample_type}",
        target_column=target_col,
        rows_count=len(df),
        columns_count=len(df.columns),
        feature_summary_json=json.dumps(stats["columns_stats"]),
        classes_json=json.dumps(list(stats["class_distribution"].keys()))
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return DatasetOut(
        id=dataset.id,
        name=dataset.name,
        dataset_type=dataset.dataset_type,
        target_column=dataset.target_column,
        rows_count=dataset.rows_count,
        columns_count=dataset.columns_count,
        classes=json.loads(dataset.classes_json) if dataset.classes_json else [],
        created_at=dataset.created_at
    )

@router.get("", response_model=List[DatasetOut])
def list_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    datasets = db.query(Dataset).filter(Dataset.user_id == current_user.id).order_by(Dataset.created_at.desc()).all()
    result = []
    for d in datasets:
        classes = json.loads(d.classes_json) if d.classes_json else []
        result.append(DatasetOut(
            id=d.id,
            name=d.name,
            dataset_type=d.dataset_type,
            target_column=d.target_column,
            rows_count=d.rows_count,
            columns_count=d.columns_count,
            classes=classes,
            created_at=d.created_at
        ))
    return result

@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return DatasetOut(
        id=dataset.id,
        name=dataset.name,
        dataset_type=dataset.dataset_type,
        target_column=dataset.target_column,
        rows_count=dataset.rows_count,
        columns_count=dataset.columns_count,
        classes=json.loads(dataset.classes_json) if dataset.classes_json else [],
        created_at=dataset.created_at
    )

@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
def get_dataset_preview(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    preview = inspect_dataset_preview(dataset.file_path, max_rows=15)
    return DatasetPreview(
        dataset_id=dataset.id,
        name=dataset.name,
        total_rows=preview["total_rows"],
        total_columns=preview["total_columns"],
        columns=preview["columns"],
        target_column=dataset.target_column or preview.get("target_column"),
        data=preview["data"],
        column_types=preview["column_types"]
    )

@router.get("/{dataset_id}/statistics", response_model=DatasetStats)
def get_dataset_statistics(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    stats = compute_dataset_statistics(dataset.file_path, target_col=dataset.target_column)
    return DatasetStats(
        dataset_id=dataset.id,
        name=dataset.name,
        total_rows=stats["total_rows"],
        total_columns=stats["total_columns"],
        numeric_columns=stats["numeric_columns"],
        categorical_columns=stats["categorical_columns"],
        target_column=dataset.target_column,
        class_distribution=stats["class_distribution"],
        columns_stats=stats["columns_stats"]
    )

@router.post("/{dataset_id}/target")
def select_target_column(
    dataset_id: int,
    req: TargetSelectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = load_dataframe(dataset.file_path)
    if req.target_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{req.target_column}' does not exist in dataset.")

    dataset.target_column = req.target_column
    counts = df[req.target_column].value_counts()
    dataset.classes_json = json.dumps([str(k) for k in counts.keys()])
    db.commit()

    return {
        "message": f"Target column set to '{req.target_column}'",
        "classes": list(counts.keys()),
        "distribution": {str(k): int(v) for k, v in counts.items()}
    }

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Remove file if in upload dir
    if dataset.file_path and os.path.exists(dataset.file_path) and "uploads" in dataset.file_path:
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass

    db.delete(dataset)
    db.commit()
    return None
