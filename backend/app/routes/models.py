import os
import json
import uuid
import numpy as np
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.dataset import Dataset
from backend.app.models.preprocessing import PreprocessingConfig
from backend.app.models.trained_model import TrainedModel
from backend.app.schemas.model import ModelTrainRequest, ModelOut, ModelDetailOut, MetricDetails
from backend.app.security.dependencies import get_current_user
from backend.app.ml.training.trainer import (
    create_classifier,
    train_and_time_classifier,
    save_model_artifact,
    load_model_artifact
)
from backend.app.ml.evaluation.evaluator import evaluate_classifier

router = APIRouter(prefix="/api/models", tags=["Model Training & Clean Evaluation"])

@router.post("/train", response_model=ModelDetailOut, status_code=status.HTTP_201_CREATED)
def train_model(
    req: ModelTrainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == req.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    prep_config = db.query(PreprocessingConfig).filter(PreprocessingConfig.id == req.preprocessing_id).first()
    if not prep_config or not prep_config.processed_data_path or not os.path.exists(prep_config.processed_data_path):
        raise HTTPException(status_code=400, detail="Processed dataset matrices not found. Please run preprocessing first.")

    # Load data matrices
    data = np.load(prep_config.processed_data_path)
    X_train = data["X_train"]
    X_test = data["X_test"]
    y_train = data["y_train"]
    y_test = data["y_test"]

    feature_names = json.loads(prep_config.selected_features_json) if prep_config.selected_features_json else []
    target_classes = json.loads(prep_config.target_classes_json) if prep_config.target_classes_json else []
    feature_bounds = json.loads(prep_config.feature_bounds_json) if prep_config.feature_bounds_json else {}

    # Create and train classifier
    try:
        classifier = create_classifier(req.algorithm, req.parameters)
        classifier, duration = train_and_time_classifier(classifier, X_train, y_train)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Model training failed: {str(e)}")

    # Clean Evaluation
    eval_metrics = evaluate_classifier(classifier, X_test, y_test, target_classes)
    eval_metrics["training_duration"] = duration

    # Save model artifact
    model_id_str = uuid.uuid4().hex[:10]
    model_filename = f"model_{req.algorithm}_{dataset.id}_{model_id_str}.joblib"
    model_path = os.path.join(settings.MODEL_DIR, model_filename)

    save_model_artifact(classifier, model_path, {
        "algorithm": req.algorithm,
        "parameters": req.parameters or {},
        "feature_names": feature_names,
        "classes": target_classes,
        "feature_bounds": feature_bounds
    })

    model_record = TrainedModel(
        user_id=current_user.id,
        dataset_id=dataset.id,
        preprocessing_id=prep_config.id,
        model_name=req.model_name,
        algorithm=req.algorithm,
        parameters_json=json.dumps(req.parameters or {}),
        model_file_path=model_path,
        clean_accuracy=eval_metrics["accuracy"],
        precision=eval_metrics["precision"],
        recall=eval_metrics["recall"],
        f1_score=eval_metrics["f1_score"],
        roc_auc=eval_metrics["roc_auc"],
        fpr=eval_metrics["fpr"],
        fnr=eval_metrics["fnr"],
        training_duration=duration,
        feature_names_json=prep_config.selected_features_json,
        target_classes_json=prep_config.target_classes_json,
        confusion_matrix_json=json.dumps(eval_metrics["confusion_matrix"]),
        metrics_json=json.dumps(eval_metrics)
    )
    db.add(model_record)
    db.commit()
    db.refresh(model_record)

    metric_details = MetricDetails(
        accuracy=eval_metrics["accuracy"],
        precision=eval_metrics["precision"],
        recall=eval_metrics["recall"],
        f1_score=eval_metrics["f1_score"],
        roc_auc=eval_metrics["roc_auc"],
        fpr=eval_metrics["fpr"],
        fnr=eval_metrics["fnr"],
        confusion_matrix=eval_metrics["confusion_matrix"],
        classes=eval_metrics["classes"],
        training_duration=duration,
        roc_curve=eval_metrics["roc_curve"],
        confidence_distribution=eval_metrics["confidence_distribution"]
    )

    return ModelDetailOut(
        id=model_record.id,
        user_id=model_record.user_id,
        dataset_id=model_record.dataset_id,
        preprocessing_id=model_record.preprocessing_id,
        model_name=model_record.model_name,
        algorithm=model_record.algorithm,
        parameters=json.loads(model_record.parameters_json) if model_record.parameters_json else {},
        clean_accuracy=model_record.clean_accuracy,
        precision=model_record.precision,
        recall=model_record.recall,
        f1_score=model_record.f1_score,
        roc_auc=model_record.roc_auc,
        fpr=model_record.fpr,
        fnr=model_record.fnr,
        training_duration=model_record.training_duration,
        feature_names=feature_names,
        target_classes=target_classes,
        confusion_matrix=eval_metrics["confusion_matrix"],
        created_at=model_record.created_at,
        metrics=metric_details
    )

@router.get("", response_model=List[ModelOut])
def list_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    models = db.query(TrainedModel).filter(TrainedModel.user_id == current_user.id).order_by(TrainedModel.created_at.desc()).all()
    results = []
    for m in models:
        cm = json.loads(m.confusion_matrix_json) if m.confusion_matrix_json else []
        feats = json.loads(m.feature_names_json) if m.feature_names_json else []
        classes = json.loads(m.target_classes_json) if m.target_classes_json else []
        params = json.loads(m.parameters_json) if m.parameters_json else {}
        results.append(ModelOut(
            id=m.id,
            user_id=m.user_id,
            dataset_id=m.dataset_id,
            preprocessing_id=m.preprocessing_id,
            model_name=m.model_name,
            algorithm=m.algorithm,
            parameters=params,
            clean_accuracy=m.clean_accuracy,
            precision=m.precision,
            recall=m.recall,
            f1_score=m.f1_score,
            roc_auc=m.roc_auc,
            fpr=m.fpr,
            fnr=m.fnr,
            training_duration=m.training_duration,
            feature_names=feats,
            target_classes=classes,
            confusion_matrix=cm,
            created_at=m.created_at
        ))
    return results

@router.get("/{model_id}", response_model=ModelDetailOut)
def get_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    m = db.query(TrainedModel).filter(TrainedModel.id == model_id, TrainedModel.user_id == current_user.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")

    metrics = json.loads(m.metrics_json) if m.metrics_json else {}
    feats = json.loads(m.feature_names_json) if m.feature_names_json else []
    classes = json.loads(m.target_classes_json) if m.target_classes_json else []
    params = json.loads(m.parameters_json) if m.parameters_json else {}
    cm = json.loads(m.confusion_matrix_json) if m.confusion_matrix_json else []

    metric_details = MetricDetails(
        accuracy=m.clean_accuracy,
        precision=m.precision,
        recall=m.recall,
        f1_score=m.f1_score,
        roc_auc=m.roc_auc,
        fpr=m.fpr,
        fnr=m.fnr,
        confusion_matrix=cm,
        classes=classes,
        training_duration=m.training_duration,
        roc_curve=metrics.get("roc_curve"),
        confidence_distribution=metrics.get("confidence_distribution")
    )

    return ModelDetailOut(
        id=m.id,
        user_id=m.user_id,
        dataset_id=m.dataset_id,
        preprocessing_id=m.preprocessing_id,
        model_name=m.model_name,
        algorithm=m.algorithm,
        parameters=params,
        clean_accuracy=m.clean_accuracy,
        precision=m.precision,
        recall=m.recall,
        f1_score=m.f1_score,
        roc_auc=m.roc_auc,
        fpr=m.fpr,
        fnr=m.fnr,
        training_duration=m.training_duration,
        feature_names=feats,
        target_classes=classes,
        confusion_matrix=cm,
        created_at=m.created_at,
        metrics=metric_details
    )

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model = db.query(TrainedModel).filter(TrainedModel.id == model_id, TrainedModel.user_id == current_user.id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    if model.model_file_path and os.path.exists(model.model_file_path):
        try:
            os.remove(model.model_file_path)
        except Exception:
            pass

    db.delete(model)
    db.commit()
    return None
