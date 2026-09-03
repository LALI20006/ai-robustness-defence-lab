import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DatasetOut(BaseModel):
    id: int
    name: str
    dataset_type: str
    target_column: Optional[str] = None
    rows_count: int
    columns_count: int
    classes: Optional[List[str]] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ColumnStat(BaseModel):
    name: str
    dtype: str
    missing_count: int
    missing_pct: float
    unique_count: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    sample_values: List[Any] = []

class DatasetPreview(BaseModel):
    dataset_id: int
    name: str
    total_rows: int
    total_columns: int
    columns: List[str]
    target_column: Optional[str]
    data: List[Dict[str, Any]]
    column_types: Dict[str, str]

class DatasetStats(BaseModel):
    dataset_id: int
    name: str
    total_rows: int
    total_columns: int
    numeric_columns: List[str]
    categorical_columns: List[str]
    target_column: Optional[str]
    class_distribution: Dict[str, int]
    columns_stats: List[ColumnStat]

class TargetSelectRequest(BaseModel):
    target_column: str
