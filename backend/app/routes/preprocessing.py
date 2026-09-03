import os
import json
import uuid
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.dataset import Dataset
from backend.app.models.preprocessing import PreprocessingConfig
from backend.app.schemas.preprocessing import PreprocessingCreate, PreprocessingOut
from backend.app.security.dependencies import get_current_user
from backend.app.ml.preprocessing.preprocessor import PreprocessingPipeline, load_dataframe

router = APIRouter(prefix="/api/preprocessing", tags=["Preprocessing"])

@router.post("/run", response_model=PreprocessingOut, status_code=status.HTTP_201_CREATED)
def run_preprocessing(
    req: PreprocessingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == req.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if not dataset.target_column:
        raise HTTPException(status_code=400, detail="Dataset target column must be selected before preprocessing.")

    if not os.path.exists(dataset.file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found on disk.")

    df = load_dataframe(dataset.file_path)

    pipeline = PreprocessingPipeline(
        missing_value_strategy=req.missing_value_strategy,
        encoding_method=req.encoding_method,
        scaling_method=req.scaling_method,
        feature_selection_method=req.feature_selection_method,
        selected_features=req.selected_features,
        k_best=req.k_best,
        variance_threshold=req.variance_threshold,
        test_size=req.test_size,
        random_seed=req.random_seed
    )

    try:
        X_train, X_test, y_train, y_test, summary = pipeline.fit_transform(df, target_col=dataset.target_column)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Preprocessing failed: {str(e)}")

    pipeline_id = uuid.uuid4().hex[:10]
    pipeline_filename = f"pipeline_{dataset.id}_{pipeline_id}.joblib"
    pipeline_path = os.path.join(settings.PROCESSED_DIR, pipeline_filename)
    pipeline.save(pipeline_path)

    # Save processed arrays for fast model training
    data_filename = f"data_{dataset.id}_{pipeline_id}.npz"
    data_path = os.path.join(settings.PROCESSED_DIR, data_filename)
    np.savez_compressed(
        data_path,
        X_train=X_train,
        X_test=X_test,
        y_train=y_train,
        y_test=y_test
    )

    config_record = PreprocessingConfig(
        dataset_id=dataset.id,
        missing_value_strategy=req.missing_value_strategy,
        encoding_method=req.encoding_method,
        scaling_method=req.scaling_method,
        feature_selection_method=req.feature_selection_method,
        selected_features_json=json.dumps(pipeline.processed_feature_names_),
        feature_bounds_json=json.dumps(pipeline.feature_bounds_),
        target_classes_json=json.dumps(pipeline.target_classes_),
        test_size=req.test_size,
        random_seed=req.random_seed,
        processed_data_path=data_path,
        pipeline_file_path=pipeline_path,
        train_rows=len(X_train),
        test_rows=len(X_test)
    )
    db.add(config_record)
    db.commit()
    db.refresh(config_record)

    return PreprocessingOut(
        id=config_record.id,
        dataset_id=dataset.id,
        missing_value_strategy=config_record.missing_value_strategy,
        encoding_method=config_record.encoding_method,
        scaling_method=config_record.scaling_method,
        feature_selection_method=config_record.feature_selection_method,
        test_size=config_record.test_size,
        random_seed=config_record.random_seed,
        train_rows=config_record.train_rows,
        test_rows=config_record.test_rows,
        original_features_count=summary["original_feature_count"],
        processed_features_count=summary["final_feature_count"],
        selected_features=pipeline.processed_feature_names_,
        target_classes=pipeline.target_classes_,
        target_distribution=summary["target_distribution"],
        created_at=config_record.created_at
    )

@router.get("/{config_id}", response_model=PreprocessingOut)
def get_preprocessing_config(
    config_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(PreprocessingConfig).join(Dataset).filter(
        PreprocessingConfig.id == config_id,
        Dataset.user_id == current_user.id
    ).first()
    if not config:
        raise HTTPException(status_code=404, detail="Preprocessing configuration not found")

    selected_features = json.loads(config.selected_features_json) if config.selected_features_json else []
    target_classes = json.loads(config.target_classes_json) if config.target_classes_json else []

    return PreprocessingOut(
        id=config.id,
        dataset_id=config.dataset_id,
        missing_value_strategy=config.missing_value_strategy,
        encoding_method=config.encoding_method,
        scaling_method=config.scaling_method,
        feature_selection_method=config.feature_selection_method,
        test_size=config.test_size,
        random_seed=config.random_seed,
        train_rows=config.train_rows,
        test_rows=config.test_rows,
        original_features_count=len(selected_features),
        processed_features_count=len(selected_features),
        selected_features=selected_features,
        target_classes=target_classes,
        target_distribution={},
        created_at=config.created_at
    )
