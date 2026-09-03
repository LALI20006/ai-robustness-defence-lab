import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("trained_models.id"), nullable=False)
    
    # Experiment parameters
    perturbation_method = Column(String(100), nullable=False) # random_noise, gaussian_noise, bounded_perturbation, feature_masking, feature_dropout
    perturbation_strength = Column(Float, default=0.05) # e.g. 0.01, 0.05, 0.10
    defence_method = Column(String(100), default="none") # none, input_validation, robust_scaling, feature_selection, adversarial_training, ensemble
    
    # Robustness metrics
    clean_accuracy = Column(Float, nullable=False, default=0.0)
    robust_accuracy = Column(Float, nullable=False, default=0.0)
    accuracy_drop = Column(Float, nullable=False, default=0.0)
    relative_accuracy_drop = Column(Float, default=0.0)
    attack_success_rate = Column(Float, default=0.0)
    prediction_flip_rate = Column(Float, default=0.0)
    confidence_drop = Column(Float, default=0.0)
    
    # Defended metrics (if defense applied)
    defended_clean_accuracy = Column(Float, nullable=True)
    defended_robust_accuracy = Column(Float, nullable=True)
    defended_accuracy = Column(Float, nullable=True) # General defended accuracy alias
    robustness_improvement = Column(Float, nullable=True) # defended_robust - robust
    attack_reduction = Column(Float, nullable=True) # original ASR - defended ASR
    
    metadata_json = Column(Text, nullable=True) # Full details, sensitivity rankings, confusion matrices
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="experiments")
    dataset = relationship("Dataset", back_populates="experiments")
    model = relationship("TrainedModel", back_populates="experiments")
    results = relationship("ExperimentResult", back_populates="experiment", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="experiment", cascade="all, delete-orphan")
