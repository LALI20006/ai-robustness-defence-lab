import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ReportGenerateRequest(BaseModel):
    experiment_id: int
    format: str = "pdf" # pdf or html
    custom_title: Optional[str] = None

class ReportOut(BaseModel):
    id: int
    experiment_id: int
    title: str
    format: str
    report_path: str
    download_url: str
    conclusion: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DashboardSummaryOut(BaseModel):
    total_datasets: int
    total_models: int
    total_experiments: int
    best_clean_accuracy: float
    best_robust_accuracy: float
    latest_experiment: Optional[Dict[str, Any]] = None
    recent_experiments: list = []
    model_robustness_overview: list = []
    recent_activity: list = []
