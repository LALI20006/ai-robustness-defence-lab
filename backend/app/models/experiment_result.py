from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    sample_index = Column(Integer, nullable=False)
    true_label = Column(String(100), nullable=False)
    clean_prediction = Column(String(100), nullable=False)
    perturbed_prediction = Column(String(100), nullable=False)
    clean_confidence = Column(Float, nullable=True)
    perturbed_confidence = Column(Float, nullable=True)
    prediction_changed = Column(Boolean, default=False)

    experiment = relationship("Experiment", back_populates="results")
