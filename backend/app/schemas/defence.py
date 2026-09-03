from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class InputValidationRequest(BaseModel):
    model_id: int
    outlier_method: str = Field(default="iqr", description="iqr or zscore")
    strict_bounds: bool = True
    reject_nans: bool = True

class ValidationSampleResult(BaseModel):
    sample_index: int
    status: str # VALID, WARNING, REJECTED
    reasons: List[str]

class InputValidationOut(BaseModel):
    model_id: int
    total_samples: int
    valid_count: int
    warning_count: int
    rejected_count: int
    validation_rate: float
    rejection_rate: float
    details: List[ValidationSampleResult]

class AdversarialTrainingRequest(BaseModel):
    model_id: int
    augmentation_ratio: float = Field(default=0.25, ge=0.05, le=1.0) # percentage of training samples augmented
    perturbation_method: str = Field(default="bounded_perturbation")
    perturbation_strength: float = Field(default=0.05, ge=0.01, le=0.2)
    random_seed: int = 42

class AdversarialTrainingOut(BaseModel):
    experiment_id: int
    defended_model_id: int
    defended_model_name: str
    original_model_id: int
    augmentation_ratio: float
    perturbation_strength: float
    original_clean_accuracy: float
    original_robust_accuracy: float
    original_attack_success_rate: float
    defended_clean_accuracy: float
    defended_robust_accuracy: float
    defended_attack_success_rate: float
    robustness_improvement: float
    attack_reduction: float
    confusion_matrix_before: List[List[int]]
    confusion_matrix_after: List[List[int]]
    classes: List[str]

class EnsembleRequest(BaseModel):
    model_ids: List[int]
    voting: str = Field(default="soft", description="soft or hard")
    ensemble_name: str = "Ensemble_Defender"

class EnsembleOut(BaseModel):
    defended_model_id: int
    ensemble_name: str
    component_models: List[str]
    clean_accuracy: float
    robust_accuracy: float
    attack_success_rate: float
    robustness_improvement: float
    attack_reduction: float
