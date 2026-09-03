from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class ActivityItem(BaseModel):
    action: str # "Dataset Uploaded", "Model Trained", "Experiment Completed", etc.
    description: str
    timestamp: str
    status: str # "success", "warning", "info"

class DashboardSummaryOut(BaseModel):
    total_datasets: int
    total_models: int
    total_experiments: int
    best_clean_accuracy: float
    best_robust_accuracy: float
    latest_experiment: Optional[Dict[str, Any]] = None
    recent_experiments: List[Dict[str, Any]] = []
    model_robustness_overview: List[Dict[str, Any]] = []
    recent_activity: List[ActivityItem] = []
