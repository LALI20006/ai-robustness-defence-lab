import os
import json
import numpy as np
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.trained_model import TrainedModel
from backend.app.models.preprocessing import PreprocessingConfig
from backend.app.models.dataset import Dataset
from backend.app.models.experiment import Experiment
from backend.app.models.experiment_result import ExperimentResult
from backend.app.schemas.robustness import RobustnessRunRequest, RobustnessResultOut, SampleResultOut, FeatureSensitivityItem
from backend.app.security.dependencies import get_current_user
from backend.app.ml.training.trainer import load_model_artifact
from backend.app.ml.robustness.evaluator import run_robustness_evaluation

router = APIRouter(prefix="/api/robustness", tags=["Robustness Lab"])

@router.post("/run", response_model=RobustnessResultOut, status_code=status.HTTP_201_CREATED)
def run_robustness_test(
    req: RobustnessRunRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model_record = db.query(TrainedModel).filter(
        TrainedModel.id == req.model_id,
        TrainedModel.user_id == current_user.id
    ).first()
    if not model_record:
        raise HTTPException(status_code=404, detail="Model not found")

    dataset = db.query(Dataset).filter(Dataset.id == model_record.dataset_id).first()
    prep_config = db.query(PreprocessingConfig).filter(PreprocessingConfig.id == model_record.preprocessing_id).first()
    if not prep_config or not prep_config.processed_data_path or not os.path.exists(prep_config.processed_data_path):
        raise HTTPException(status_code=400, detail="Processed test data not found.")

    if not os.path.exists(model_record.model_file_path):
        raise HTTPException(status_code=404, detail="Serialized model artifact file missing on disk.")

    # Load model and test data
    classifier, metadata = load_model_artifact(model_record.model_file_path)
    data = np.load(prep_config.processed_data_path)
    X_test = data["X_test"]
    y_test = data["y_test"]

    feature_bounds = metadata.get("feature_bounds") or json.loads(prep_config.feature_bounds_json or "{}")
    feature_names = metadata.get("feature_names") or json.loads(prep_config.selected_features_json or "[]")
    target_classes = metadata.get("classes") or json.loads(prep_config.target_classes_json or "[]")

    # Execute robustness evaluation
    try:
        eval_res = run_robustness_evaluation(
            classifier=classifier,
            X_test=X_test,
            y_test=y_test,
            feature_bounds=feature_bounds,
            feature_names=feature_names,
            target_classes=target_classes,
            perturbation_method=req.perturbation_method,
            perturbation_strength=req.perturbation_strength,
            mask_count=req.mask_count or 3,
            mask_replacement=req.mask_replacement or "median",
            random_seed=req.random_seed or 42
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Robustness test execution failed: {str(e)}")

    # Store Experiment record
    experiment = Experiment(
        user_id=current_user.id,
        dataset_id=dataset.id,
        model_id=model_record.id,
        perturbation_method=req.perturbation_method,
        perturbation_strength=req.perturbation_strength,
        defence_method="none",
        clean_accuracy=eval_res["clean_accuracy"],
        robust_accuracy=eval_res["robust_accuracy"],
        accuracy_drop=eval_res["accuracy_drop"],
        relative_accuracy_drop=eval_res["relative_accuracy_drop"],
        attack_success_rate=eval_res["attack_success_rate"],
        prediction_flip_rate=eval_res["prediction_flip_rate"],
        confidence_drop=eval_res["confidence_drop"],
        metadata_json=json.dumps({
            "strength_sweep": eval_res.get("strength_sweep", []),
            "feature_sensitivity": eval_res.get("feature_sensitivity", [])[:10],
            "confusion_matrix_clean": eval_res.get("confusion_matrix_clean", []),
            "confusion_matrix_perturbed": eval_res.get("confusion_matrix_perturbed", [])
        })
    )
    db.add(experiment)
    db.commit()
    db.refresh(experiment)

    # Store first 100 sample prediction rows
    sample_records = []
    for s in eval_res["sample_results"][:100]:
        res_item = ExperimentResult(
            experiment_id=experiment.id,
            sample_index=s["sample_index"],
            true_label=s["true_label"],
            clean_prediction=s["clean_prediction"],
            perturbed_prediction=s["perturbed_prediction"],
            clean_confidence=s["clean_confidence"],
            perturbed_confidence=s["perturbed_confidence"],
            prediction_changed=s["prediction_changed"]
        )
        sample_records.append(res_item)
    db.bulk_save_objects(sample_records)
    db.commit()

    sample_outs = [SampleResultOut(**s) for s in eval_res["sample_results"][:50]]
    sensitivity_outs = [FeatureSensitivityItem(**item) for item in eval_res.get("feature_sensitivity", [])[:10]]

    return RobustnessResultOut(
        experiment_id=experiment.id,
        model_id=model_record.id,
        model_name=model_record.model_name,
        algorithm=model_record.algorithm,
        dataset_name=dataset.name,
        perturbation_method=req.perturbation_method,
        perturbation_strength=req.perturbation_strength,
        clean_accuracy=eval_res["clean_accuracy"],
        robust_accuracy=eval_res["robust_accuracy"],
        accuracy_drop=eval_res["accuracy_drop"],
        relative_accuracy_drop=eval_res["relative_accuracy_drop"],
        attack_success_rate=eval_res["attack_success_rate"],
        prediction_flip_rate=eval_res["prediction_flip_rate"],
        confidence_drop=eval_res["confidence_drop"],
        confusion_matrix_clean=eval_res["confusion_matrix_clean"],
        confusion_matrix_perturbed=eval_res["confusion_matrix_perturbed"],
        classes=target_classes,
        sample_results=sample_outs,
        strength_sweep=eval_res.get("strength_sweep"),
        feature_sensitivity=sensitivity_outs,
        created_at=experiment.created_at
    )

@router.get("/experiments/{experiment_id}", response_model=RobustnessResultOut)
def get_experiment(
    experiment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.user_id == current_user.id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    model = db.query(TrainedModel).filter(TrainedModel.id == exp.model_id).first()
    dataset = db.query(Dataset).filter(Dataset.id == exp.dataset_id).first()
    meta = json.loads(exp.metadata_json or "{}")

    # Get sample results
    res_rows = db.query(ExperimentResult).filter(ExperimentResult.experiment_id == exp.id).limit(50).all()
    sample_outs = [
        SampleResultOut(
            sample_index=r.sample_index,
            true_label=r.true_label,
            clean_prediction=r.clean_prediction,
            perturbed_prediction=r.perturbed_prediction,
            clean_confidence=r.clean_confidence,
            perturbed_confidence=r.perturbed_confidence,
            prediction_changed=r.prediction_changed
        )
        for r in res_rows
    ]

    sensitivity_items = [
        FeatureSensitivityItem(**item) for item in meta.get("feature_sensitivity", [])
    ]

    target_classes = json.loads(model.target_classes_json) if model and model.target_classes_json else []

    return RobustnessResultOut(
        experiment_id=exp.id,
        model_id=exp.model_id,
        model_name=model.model_name if model else "Model",
        algorithm=model.algorithm if model else "N/A",
        dataset_name=dataset.name if dataset else "Dataset",
        perturbation_method=exp.perturbation_method,
        perturbation_strength=exp.perturbation_strength,
        clean_accuracy=exp.clean_accuracy,
        robust_accuracy=exp.robust_accuracy,
        accuracy_drop=exp.accuracy_drop,
        relative_accuracy_drop=exp.relative_accuracy_drop or 0.0,
        attack_success_rate=exp.attack_success_rate or 0.0,
        prediction_flip_rate=exp.prediction_flip_rate or 0.0,
        confidence_drop=exp.confidence_drop or 0.0,
        confusion_matrix_clean=meta.get("confusion_matrix_clean", []),
        confusion_matrix_perturbed=meta.get("confusion_matrix_perturbed", []),
        classes=target_classes,
        sample_results=sample_outs,
        strength_sweep=meta.get("strength_sweep"),
        feature_sensitivity=sensitivity_items,
        created_at=exp.created_at
    )

@router.delete("/experiments/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(
    experiment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experiment).filter(Experiment.id == experiment_id, Experiment.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(exp)
    db.commit()
    return None
