import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RobustnessRunRequest(BaseModel):
    model_id: int
    perturbation_method: str = Field(..., description="random_noise, gaussian_noise, bounded_perturbation, feature_masking, feature_dropout")
    perturbation_strength: float = Field(default=0.05, ge=0.001, le=1.0)
    features_to_mask: Optional[List[str]] = None
    mask_count: Optional[int] = 3
    mask_replacement: Optional[str] = "median" # median, mean, zero
    random_seed: Optional[int] = 42

class SampleResultOut(BaseModel):
    sample_index: int
    true_label: str
    clean_prediction: str
    perturbed_prediction: str
    clean_confidence: Optional[float]
    perturbed_confidence: Optional[float]
    prediction_changed: bool

class FeatureSensitivityItem(BaseModel):
    feature_name: str
    impact_drop: float
    accuracy_without_feature: float

class RobustnessResultOut(BaseModel):
    experiment_id: int
    model_id: int
    model_name: str
    algorithm: str
    dataset_name: str
    perturbation_method: str
    perturbation_strength: float
    clean_accuracy: float
    robust_accuracy: float
    accuracy_drop: float
    relative_accuracy_drop: float
    attack_success_rate: float
    prediction_flip_rate: float
    confidence_drop: float
    confusion_matrix_clean: List[List[int]]
    confusion_matrix_perturbed: List[List[int]]
    classes: List[str]
    sample_results: List[SampleResultOut]
    strength_sweep: Optional[List[Dict[str, Any]]] = None # accuracy curve across strengths 1%, 2%, 5%, 10%, etc.
    feature_sensitivity: Optional[List[FeatureSensitivityItem]] = None
    created_at: datetime.datetime
