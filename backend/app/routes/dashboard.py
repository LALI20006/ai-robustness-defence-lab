import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.dataset import Dataset
from backend.app.models.trained_model import TrainedModel
from backend.app.models.experiment import Experiment
from backend.app.models.report import Report
from backend.app.schemas.dashboard import DashboardSummaryOut, ActivityItem
from backend.app.security.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_datasets = db.query(func.count(Dataset.id)).filter(Dataset.user_id == current_user.id).scalar() or 0
    total_models = db.query(func.count(TrainedModel.id)).filter(TrainedModel.user_id == current_user.id).scalar() or 0
    total_experiments = db.query(func.count(Experiment.id)).filter(Experiment.user_id == current_user.id).scalar() or 0

    best_clean = db.query(func.max(TrainedModel.clean_accuracy)).filter(TrainedModel.user_id == current_user.id).scalar() or 0.0
    best_robust = db.query(func.max(Experiment.robust_accuracy)).filter(Experiment.user_id == current_user.id).scalar() or 0.0

    # Latest experiment
    latest_exp = db.query(Experiment).filter(Experiment.user_id == current_user.id).order_by(Experiment.created_at.desc()).first()
    latest_exp_dict = None
    if latest_exp:
        m = db.query(TrainedModel).filter(TrainedModel.id == latest_exp.model_id).first()
        latest_exp_dict = {
            "id": latest_exp.id,
            "model_name": m.model_name if m else "Unknown",
            "perturbation_method": latest_exp.perturbation_method,
            "perturbation_strength": latest_exp.perturbation_strength,
            "clean_accuracy": latest_exp.clean_accuracy,
            "robust_accuracy": latest_exp.robust_accuracy,
            "accuracy_drop": latest_exp.accuracy_drop,
            "attack_success_rate": latest_exp.attack_success_rate,
            "defence_method": latest_exp.defence_method,
            "defended_robust_accuracy": latest_exp.defended_robust_accuracy,
            "created_at": latest_exp.created_at.strftime("%Y-%m-%d %H:%M")
        }

    # Recent experiments table
    recent_exps = db.query(Experiment).filter(Experiment.user_id == current_user.id).order_by(Experiment.created_at.desc()).limit(6).all()
    recent_list = []
    for exp in recent_exps:
        m = db.query(TrainedModel).filter(TrainedModel.id == exp.model_id).first()
        d = db.query(Dataset).filter(Dataset.id == exp.dataset_id).first()
        recent_list.append({
            "id": exp.id,
            "model_name": m.model_name if m else "Model",
            "dataset_name": d.name if d else "Dataset",
            "perturbation_method": exp.perturbation_method,
            "perturbation_strength": exp.perturbation_strength,
            "clean_accuracy": exp.clean_accuracy,
            "robust_accuracy": exp.robust_accuracy,
            "accuracy_drop": exp.accuracy_drop,
            "attack_success_rate": exp.attack_success_rate or 0.0,
            "defence_method": exp.defence_method or "none",
            "defended_robust_accuracy": exp.defended_robust_accuracy,
            "created_at": exp.created_at.strftime("%b %d, %H:%M")
        })

    # Model robustness comparison chart data
    models = db.query(TrainedModel).filter(TrainedModel.user_id == current_user.id).limit(8).all()
    robustness_overview = []
    for m in models:
        # Find latest experiment for model
        exp = db.query(Experiment).filter(Experiment.model_id == m.id).order_by(Experiment.created_at.desc()).first()
        robustness_overview.append({
            "model_name": m.model_name[:16] + "..." if len(m.model_name) > 16 else m.model_name,
            "algorithm": m.algorithm,
            "clean_accuracy": round(m.clean_accuracy * 100, 1),
            "robust_accuracy": round(exp.robust_accuracy * 100, 1) if exp else None,
            "defended_accuracy": round(exp.defended_robust_accuracy * 100, 1) if (exp and exp.defended_robust_accuracy) else None
        })

    # Recent activity log
    activity_items = []
    if latest_exp:
        activity_items.append(ActivityItem(
            action="Robustness Experiment",
            description=f"Evaluated {latest_exp.perturbation_method} on {latest_exp_dict.get('model_name')}",
            timestamp=latest_exp.created_at.strftime("%H:%M"),
            status="info"
        ))
    if total_models > 0:
        latest_model = db.query(TrainedModel).filter(TrainedModel.user_id == current_user.id).order_by(TrainedModel.created_at.desc()).first()
        if latest_model:
            activity_items.append(ActivityItem(
                action="Model Trained",
                description=f"Trained {latest_model.model_name} (Acc: {latest_model.clean_accuracy*100:.1f}%)",
                timestamp=latest_model.created_at.strftime("%H:%M"),
                status="success"
            ))
    if total_datasets > 0:
        latest_ds = db.query(Dataset).filter(Dataset.user_id == current_user.id).order_by(Dataset.created_at.desc()).first()
        if latest_ds:
            activity_items.append(ActivityItem(
                action="Dataset Registered",
                description=f"Added dataset '{latest_ds.name}' ({latest_ds.rows_count} rows)",
                timestamp=latest_ds.created_at.strftime("%H:%M"),
                status="info"
            ))

    return DashboardSummaryOut(
        total_datasets=total_datasets,
        total_models=total_models,
        total_experiments=total_experiments,
        best_clean_accuracy=best_clean,
        best_robust_accuracy=best_robust,
        latest_experiment=latest_exp_dict,
        recent_experiments=recent_list,
        model_robustness_overview=robustness_overview,
        recent_activity=activity_items
    )
