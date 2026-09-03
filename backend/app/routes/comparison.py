import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.dataset import Dataset
from backend.app.models.trained_model import TrainedModel
from backend.app.models.experiment import Experiment
from backend.app.schemas.comparison import (
    ModelComparisonOut, ModelComparisonItem,
    ExperimentComparisonOut, ExperimentComparisonItem
)
from backend.app.security.dependencies import get_current_user

router = APIRouter(prefix="/api/comparison", tags=["Model & Experiment Comparison"])

@router.get("/models", response_model=ModelComparisonOut)
def compare_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    models = db.query(TrainedModel).filter(TrainedModel.user_id == current_user.id).all()
    if not models:
        return ModelComparisonOut(models=[], best_clean_model=None, best_robust_model=None, best_defended_model=None)

    comparison_items = []
    best_clean_score = -1.0
    best_clean_name = None
    best_robust_score = -1.0
    best_robust_name = None
    best_def_score = -1.0
    best_def_name = None

    for m in models:
        dataset = db.query(Dataset).filter(Dataset.id == m.dataset_id).first()
        ds_name = dataset.name if dataset else "Unknown"

        # Look up latest experiment for this model
        exp = db.query(Experiment).filter(Experiment.model_id == m.id).order_by(Experiment.created_at.desc()).first()

        robust_acc = exp.robust_accuracy if exp else None
        acc_drop = exp.accuracy_drop if exp else None
        asr = exp.attack_success_rate if exp else None
        def_acc = exp.defended_robust_accuracy if (exp and exp.defended_robust_accuracy) else None

        if m.clean_accuracy > best_clean_score:
            best_clean_score = m.clean_accuracy
            best_clean_name = m.model_name

        if robust_acc is not None and robust_acc > best_robust_score:
            best_robust_score = robust_acc
            best_robust_name = m.model_name

        if def_acc is not None and def_acc > best_def_score:
            best_def_score = def_acc
            best_def_name = f"{m.model_name} (Defended)"

        comparison_items.append(ModelComparisonItem(
            model_id=m.id,
            model_name=m.model_name,
            algorithm=m.algorithm,
            dataset_name=ds_name,
            clean_accuracy=m.clean_accuracy,
            robust_accuracy=robust_acc,
            accuracy_drop=acc_drop,
            precision=m.precision,
            recall=m.recall,
            f1_score=m.f1_score,
            roc_auc=m.roc_auc,
            attack_success_rate=asr,
            defended_robust_accuracy=def_acc,
            training_duration=m.training_duration
        ))

    return ModelComparisonOut(
        models=comparison_items,
        best_clean_model=best_clean_name,
        best_robust_model=best_robust_name,
        best_defended_model=best_def_name
    )

@router.get("/experiments", response_model=ExperimentComparisonOut)
def compare_experiments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    experiments = db.query(Experiment).filter(Experiment.user_id == current_user.id).order_by(Experiment.created_at.desc()).all()
    items = []
    for exp in experiments:
        m = db.query(TrainedModel).filter(TrainedModel.id == exp.model_id).first()
        d = db.query(Dataset).filter(Dataset.id == exp.dataset_id).first()
        items.append(ExperimentComparisonItem(
            experiment_id=exp.id,
            model_name=m.model_name if m else "Unknown Model",
            dataset_name=d.name if d else "Unknown Dataset",
            perturbation_method=exp.perturbation_method,
            perturbation_strength=exp.perturbation_strength,
            defence_method=exp.defence_method or "none",
            clean_accuracy=exp.clean_accuracy,
            robust_accuracy=exp.robust_accuracy,
            accuracy_drop=exp.accuracy_drop,
            attack_success_rate=exp.attack_success_rate or 0.0,
            prediction_flip_rate=exp.prediction_flip_rate or 0.0,
            defended_robust_accuracy=exp.defended_robust_accuracy,
            robustness_improvement=exp.robustness_improvement,
            created_at=exp.created_at.strftime("%Y-%m-%d %H:%M")
        ))
    return ExperimentComparisonOut(experiments=items)
