import os
import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.experiment import Experiment
from backend.app.models.trained_model import TrainedModel
from backend.app.models.dataset import Dataset
from backend.app.models.preprocessing import PreprocessingConfig
from backend.app.models.report import Report
from backend.app.schemas.report import ReportGenerateRequest, ReportOut
from backend.app.security.dependencies import get_current_user
from backend.app.services.report_service import generate_pdf_report, generate_html_report, generate_academic_conclusion

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/generate/{experiment_id}", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    experiment_id: int,
    req: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.user_id == current_user.id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    model = db.query(TrainedModel).filter(TrainedModel.id == exp.model_id).first()
    dataset = db.query(Dataset).filter(Dataset.id == exp.dataset_id).first()
    prep_config = db.query(PreprocessingConfig).filter(PreprocessingConfig.id == model.preprocessing_id).first() if model else None

    # Compile data payload
    report_data = {
        "user_name": current_user.full_name,
        "dataset_name": dataset.name if dataset else "Cybersecurity Dataset",
        "target_column": dataset.target_column if dataset else "label",
        "algorithm": model.algorithm if model else "N/A",
        "missing_value_strategy": prep_config.missing_value_strategy if prep_config else "mean",
        "encoding_method": prep_config.encoding_method if prep_config else "onehot",
        "scaling_method": prep_config.scaling_method if prep_config else "standard",
        "feature_selection_method": prep_config.feature_selection_method if prep_config else "all",
        "test_size": prep_config.test_size if prep_config else 0.2,
        "num_features": len(json.loads(prep_config.selected_features_json or "[]")) if prep_config else 0,
        "perturbation_method": exp.perturbation_method,
        "perturbation_strength": exp.perturbation_strength,
        "defence_method": exp.defence_method or "none",
        "clean_accuracy": exp.clean_accuracy,
        "robust_accuracy": exp.robust_accuracy,
        "accuracy_drop": exp.accuracy_drop,
        "attack_success_rate": exp.attack_success_rate or 0.0,
        "prediction_flip_rate": exp.prediction_flip_rate or 0.0,
        "defended_robust_accuracy": exp.defended_robust_accuracy,
        "defended_attack_success_rate": max(0.0, (exp.attack_success_rate or 0.0) - (exp.attack_reduction or 0.0)),
        "robustness_improvement": exp.robustness_improvement,
        "random_seed": prep_config.random_seed if prep_config else 42
    }

    conclusion_text = generate_academic_conclusion(
        algorithm_name=report_data["algorithm"],
        clean_acc=exp.clean_accuracy,
        perturbation_method=exp.perturbation_method,
        perturbation_strength=exp.perturbation_strength,
        robust_acc=exp.robust_accuracy,
        acc_drop=exp.accuracy_drop,
        asr=exp.attack_success_rate or 0.0,
        defence_method=exp.defence_method or "none",
        defended_robust_acc=exp.defended_robust_accuracy,
        robustness_improvement=exp.robustness_improvement
    )
    report_data["conclusion"] = conclusion_text

    rep_id = uuid.uuid4().hex[:8]
    format_type = req.format.lower()
    title = req.custom_title or f"Robustness Evaluation - {report_data['dataset_name']} ({report_data['algorithm'].title()})"

    if format_type == "pdf":
        filename = f"report_{exp.id}_{rep_id}.pdf"
        report_path = generate_pdf_report(filename, report_data)
    else:
        filename = f"report_{exp.id}_{rep_id}.html"
        report_path = os.path.join(settings.REPORT_DIR, filename)
        html_content = generate_html_report(report_data)
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(html_content)

    report_record = Report(
        user_id=current_user.id,
        experiment_id=exp.id,
        title=title,
        report_path=report_path,
        format=format_type
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return ReportOut(
        id=report_record.id,
        experiment_id=exp.id,
        title=report_record.title,
        format=report_record.format,
        report_path=report_record.report_path,
        download_url=f"/api/reports/{report_record.id}/download",
        conclusion=conclusion_text,
        created_at=report_record.created_at
    )

@router.get("", response_model=List[ReportOut])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        exp = db.query(Experiment).filter(Experiment.id == r.experiment_id).first()
        model = db.query(TrainedModel).filter(TrainedModel.id == exp.model_id).first() if exp else None
        conclusion = generate_academic_conclusion(
            algorithm_name=model.algorithm if model else "Classifier",
            clean_acc=exp.clean_accuracy if exp else 0.9,
            perturbation_method=exp.perturbation_method if exp else "noise",
            perturbation_strength=exp.perturbation_strength if exp else 0.05,
            robust_acc=exp.robust_accuracy if exp else 0.75,
            acc_drop=exp.accuracy_drop if exp else 0.15,
            asr=exp.attack_success_rate or 0.0 if exp else 15.0,
            defence_method=exp.defence_method or "none" if exp else "none",
            defended_robust_acc=exp.defended_robust_accuracy if exp else None,
            robustness_improvement=exp.robustness_improvement if exp else None
        )
        results.append(ReportOut(
            id=r.id,
            experiment_id=r.experiment_id,
            title=r.title,
            format=r.format,
            report_path=r.report_path,
            download_url=f"/api/reports/{r.id}/download",
            conclusion=conclusion,
            created_at=r.created_at
        ))
    return results

@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.report_path):
        raise HTTPException(status_code=404, detail="Report file not found")

    media_type = "application/pdf" if report.format == "pdf" else "text/html"
    return FileResponse(
        report.report_path,
        media_type=media_type,
        filename=os.path.basename(report.report_path)
    )

@router.get("/{report_id}/view")
def view_html_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.report_path):
        raise HTTPException(status_code=404, detail="Report file not found")

    if report.format == "pdf":
        return FileResponse(report.report_path, media_type="application/pdf")

    with open(report.report_path, "r", encoding="utf-8") as f:
        html = f.read()
    return HTMLResponse(content=html)
