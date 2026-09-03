import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class PreprocessingConfig(Base):
    __tablename__ = "preprocessing_configs"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    missing_value_strategy = Column(String(50), default="mean") # mean, median, drop, mode
    encoding_method = Column(String(50), default="onehot") # onehot, label
    scaling_method = Column(String(50), default="standard") # standard, minmax, robust, none
    feature_selection_method = Column(String(50), default="all") # all, variance, selectkbest, manual
    selected_features_json = Column(Text, nullable=True) # list of features retained
    feature_bounds_json = Column(Text, nullable=True) # min, max, type bounds for validity
    target_classes_json = Column(Text, nullable=True) # class mappings
    test_size = Column(Float, default=0.20)
    random_seed = Column(Integer, default=42)
    processed_data_path = Column(String(500), nullable=True)
    pipeline_file_path = Column(String(500), nullable=True)
    train_rows = Column(Integer, default=0)
    test_rows = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="preprocessing_configs")
    trained_models = relationship("TrainedModel", back_populates="preprocessing_config", cascade="all, delete-orphan")
