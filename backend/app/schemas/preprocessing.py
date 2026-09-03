import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class PreprocessingCreate(BaseModel):
    dataset_id: int
    missing_value_strategy: str = Field(default="mean", description="mean, median, drop, mode")
    encoding_method: str = Field(default="onehot", description="onehot, label")
    scaling_method: str = Field(default="standard", description="standard, minmax, robust, none")
    feature_selection_method: str = Field(default="all", description="all, variance, selectkbest, manual")
    selected_features: Optional[List[str]] = None
    k_best: Optional[int] = 10
    variance_threshold: Optional[float] = 0.01
    test_size: float = Field(default=0.20, ge=0.1, le=0.5)
    random_seed: int = Field(default=42)

class PreprocessingOut(BaseModel):
    id: int
    dataset_id: int
    missing_value_strategy: str
    encoding_method: str
    scaling_method: str
    feature_selection_method: str
    test_size: float
    random_seed: int
    train_rows: int
    test_rows: int
    original_features_count: int
    processed_features_count: int
    selected_features: List[str]
    target_classes: List[str]
    target_distribution: Dict[str, int]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PreprocessingSummary(BaseModel):
    id: int
    original_row_count: int
    final_row_count: int
    removed_rows: int
    original_feature_count: int
    final_feature_count: int
    encoding_method: str
    scaling_method: str
    target_distribution: Dict[str, int]
    train_size: int
    test_size: int
