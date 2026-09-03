import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    dataset_type = Column(String(100), default="tabular_csv") # e.g. "tabular_csv", "sample_network", "sample_malware"
    target_column = Column(String(100), nullable=True)
    rows_count = Column(Integer, default=0)
    columns_count = Column(Integer, default=0)
    feature_summary_json = Column(Text, nullable=True) # JSON summary of columns, types, stats
    classes_json = Column(Text, nullable=True) # JSON list of detected classes
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="datasets")
    preprocessing_configs = relationship("PreprocessingConfig", back_populates="dataset", cascade="all, delete-orphan")
    trained_models = relationship("TrainedModel", back_populates="dataset", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="dataset", cascade="all, delete-orphan")
