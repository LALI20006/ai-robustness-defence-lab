from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ModelComparisonItem(BaseModel):
    model_id: int
    model_name: str
    algorithm: str
    dataset_name: str
    clean_accuracy: float
    robust_accuracy: Optional[float] = None
    accuracy_drop: Optional[float] = None
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    attack_success_rate: Optional[float] = None
    defended_robust_accuracy: Optional[float] = None
    training_duration: float

class ModelComparisonOut(BaseModel):
    models: List[ModelComparisonItem]
    best_clean_model: Optional[str] = None
    best_robust_model: Optional[str] = None
    best_defended_model: Optional[str] = None

class ExperimentComparisonItem(BaseModel):
    experiment_id: int
    model_name: str
    dataset_name: str
    perturbation_method: str
    perturbation_strength: float
    defence_method: str
    clean_accuracy: float
    robust_accuracy: float
    accuracy_drop: float
    attack_success_rate: float
    prediction_flip_rate: float
    defended_robust_accuracy: Optional[float] = None
    robustness_improvement: Optional[float] = None
    created_at: str

class ExperimentComparisonOut(BaseModel):
    experiments: List[ExperimentComparisonItem]
