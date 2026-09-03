import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class TrainedModel(Base):
    __tablename__ = "trained_models"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    preprocessing_id = Column(Integer, ForeignKey("preprocessing_configs.id"), nullable=False)
    model_name = Column(String(255), nullable=False)
    algorithm = Column(String(100), nullable=False) # random_forest, logistic_regression, svm, etc.
    parameters_json = Column(Text, nullable=True) # hyperparameters dict
    model_file_path = Column(String(500), nullable=False)
    
    # Clean evaluation metrics
    clean_accuracy = Column(Float, nullable=False, default=0.0)
    precision = Column(Float, nullable=False, default=0.0)
    recall = Column(Float, nullable=False, default=0.0)
    f1_score = Column(Float, nullable=False, default=0.0)
    roc_auc = Column(Float, nullable=True)
    fpr = Column(Float, nullable=True)
    fnr = Column(Float, nullable=True)
    training_duration = Column(Float, default=0.0) # seconds
    
    feature_names_json = Column(Text, nullable=True)
    target_classes_json = Column(Text, nullable=True)
    confusion_matrix_json = Column(Text, nullable=True)
    metrics_json = Column(Text, nullable=True) # Full detailed metrics (ROC curve, confidence stats)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="trained_models")
    dataset = relationship("Dataset", back_populates="trained_models")
    preprocessing_config = relationship("PreprocessingConfig", back_populates="trained_models")
    experiments = relationship("Experiment", back_populates="model", cascade="all, delete-orphan")
