import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ModelTrainRequest(BaseModel):
    dataset_id: int
    preprocessing_id: int
    model_name: str = Field(..., min_length=1, max_length=200)
    algorithm: str = Field(..., description="logistic_regression, decision_tree, random_forest, svm, knn, gradient_boosting, mlp")
    parameters: Optional[Dict[str, Any]] = None

class MetricDetails(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    fpr: Optional[float] = None
    fnr: Optional[float] = None
    confusion_matrix: List[List[int]]
    classes: List[str]
    training_duration: float
    roc_curve: Optional[Dict[str, List[float]]] = None # fpr, tpr, thresholds
    confidence_distribution: Optional[Dict[str, List[float]]] = None # histogram bins

class ModelOut(BaseModel):
    id: int
    user_id: int
    dataset_id: int
    preprocessing_id: int
    model_name: str
    algorithm: str
    parameters: Dict[str, Any]
    clean_accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    fpr: Optional[float] = None
    fnr: Optional[float] = None
    training_duration: float
    feature_names: List[str]
    target_classes: List[str]
    confusion_matrix: List[List[int]]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ModelDetailOut(ModelOut):
    metrics: MetricDetails
