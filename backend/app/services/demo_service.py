import os
import json
import joblib
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.user import User
from backend.app.models.dataset import Dataset
from backend.app.models.preprocessing import PreprocessingConfig
from backend.app.models.trained_model import TrainedModel
from backend.app.models.experiment import Experiment
from backend.app.models.experiment_result import ExperimentResult
from backend.app.ml.preprocessing.preprocessor import PreprocessingPipeline, compute_dataset_statistics
from backend.app.ml.training.trainer import create_classifier, train_and_time_classifier, save_model_artifact
from backend.app.ml.evaluation.evaluator import evaluate_classifier
from backend.app.ml.robustness.evaluator import run_robustness_evaluation
from backend.app.ml.defenses.adversarial_training import perform_adversarial_training

def execute_demo_pipeline(user: User, db: Session) -> Dict[str, Any]:
    """
    Executes an end-to-end demo experiment using the bundled NSL-KDD intrusion sample dataset:
    Dataset -> Preprocessing -> Random Forest Training -> Clean Eval -> 5% Bounded Perturbation ->
    Adversarial Training Defense -> Comparison Metrics.
    """
    sample_csv_path = os.path.join(settings.SAMPLE_DIR, "nsl_kdd_intrusion_sample.csv")
    if not os.path.exists(sample_csv_path):
        from backend.scripts.generate_sample_data import generate_sample_datasets
        generate_sample_datasets()

    df = pd.read_csv(sample_csv_path)

    # 1. Register Dataset
    dataset = db.query(Dataset).filter(Dataset.user_id == user.id, Dataset.name == "NSL-KDD Intrusion Demo").first()
    if not dataset:
        stats = compute_dataset_statistics(sample_csv_path, target_col="label")
        dataset = Dataset(
            user_id=user.id,
            name="NSL-KDD Intrusion Demo",
            file_path=sample_csv_path,
            dataset_type="sample_network",
            target_column="label",
            rows_count=len(df),
            columns_count=len(df.columns),
            feature_summary_json=json.dumps(stats["columns_stats"]),
            classes_json=json.dumps(list(stats["class_distribution"].keys()))
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

    # 2. Run Preprocessing Pipeline
    prep_pipeline = PreprocessingPipeline(
        missing_value_strategy="mean",
        encoding_method="onehot",
        scaling_method="standard",
        feature_selection_method="all",
        test_size=0.20,
        random_seed=42
    )
    X_train, X_test, y_train, y_test, prep_summary = prep_pipeline.fit_transform(df, target_col="label")

    pipeline_filename = f"pipeline_demo_{user.id}_{dataset.id}.joblib"
    pipeline_path = os.path.join(settings.PROCESSED_DIR, pipeline_filename)
    prep_pipeline.save(pipeline_path)

    # Save PreprocessingConfig in DB
    prep_config = PreprocessingConfig(
        dataset_id=dataset.id,
        missing_value_strategy="mean",
        encoding_method="onehot",
        scaling_method="standard",
        feature_selection_method="all",
        selected_features_json=json.dumps(prep_pipeline.processed_feature_names_),
        feature_bounds_json=json.dumps(prep_pipeline.feature_bounds_),
        target_classes_json=json.dumps(prep_pipeline.target_classes_),
        test_size=0.20,
        random_seed=42,
        pipeline_file_path=pipeline_path,
        train_rows=len(X_train),
        test_rows=len(X_test)
    )
    db.add(prep_config)
    db.commit()
    db.refresh(prep_config)

    # 3. Train Baseline Classifier (Random Forest)
    rf_params = {"n_estimators": 100, "max_depth": 12, "min_samples_split": 4}
    rf_clf = create_classifier("random_forest", rf_params)
    rf_clf, train_time = train_and_time_classifier(rf_clf, X_train, y_train)

    # 4. Clean Evaluation
    clean_eval = evaluate_classifier(rf_clf, X_test, y_test, prep_pipeline.target_classes_)

    model_filename = f"model_rf_demo_{user.id}_{dataset.id}.joblib"
    model_path = os.path.join(settings.MODEL_DIR, model_filename)
    save_model_artifact(rf_clf, model_path, {
        "algorithm": "random_forest",
        "parameters": rf_params,
        "feature_names": prep_pipeline.processed_feature_names_,
        "classes": prep_pipeline.target_classes_,
        "feature_bounds": prep_pipeline.feature_bounds_
    })

    trained_model = TrainedModel(
        user_id=user.id,
        dataset_id=dataset.id,
        preprocessing_id=prep_config.id,
        model_name="Random Forest Intrusion Classifier",
        algorithm="random_forest",
        parameters_json=json.dumps(rf_params),
        model_file_path=model_path,
        clean_accuracy=clean_eval["accuracy"],
        precision=clean_eval["precision"],
        recall=clean_eval["recall"],
        f1_score=clean_eval["f1_score"],
        roc_auc=clean_eval["roc_auc"],
        fpr=clean_eval["fpr"],
        fnr=clean_eval["fnr"],
        training_duration=train_time,
        feature_names_json=json.dumps(prep_pipeline.processed_feature_names_),
        target_classes_json=json.dumps(prep_pipeline.target_classes_),
        confusion_matrix_json=json.dumps(clean_eval["confusion_matrix"]),
        metrics_json=json.dumps(clean_eval)
    )
    db.add(trained_model)
    db.commit()
    db.refresh(trained_model)

    # 5. Run Controlled Robustness Evaluation (5% Bounded Perturbation)
    robust_eval = run_robustness_evaluation(
        classifier=rf_clf,
        X_test=X_test,
        y_test=y_test,
        feature_bounds=prep_pipeline.feature_bounds_,
        feature_names=prep_pipeline.processed_feature_names_,
        target_classes=prep_pipeline.target_classes_,
        perturbation_method="bounded_perturbation",
        perturbation_strength=0.05,
        random_seed=42
    )

    # 6. Apply Adversarial Training Defense (25% augmentation with 5% bounded perturbation)
    defended_clf, adv_train_metrics = perform_adversarial_training(
        algorithm="random_forest",
        parameters=rf_params,
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test,
        feature_bounds=prep_pipeline.feature_bounds_,
        feature_names=prep_pipeline.processed_feature_names_,
        target_classes=prep_pipeline.target_classes_,
        original_model=rf_clf,
        augmentation_ratio=0.25,
        perturbation_strength=0.05,
        random_seed=42
    )

    # Save Defended Model
    def_model_filename = f"model_rf_defended_demo_{user.id}_{dataset.id}.joblib"
    def_model_path = os.path.join(settings.MODEL_DIR, def_model_filename)
    save_model_artifact(defended_clf, def_model_path, {
        "algorithm": "random_forest_defended",
        "parameters": rf_params,
        "feature_names": prep_pipeline.processed_feature_names_,
        "classes": prep_pipeline.target_classes_,
        "feature_bounds": prep_pipeline.feature_bounds_
    })

    defended_model = TrainedModel(
        user_id=user.id,
        dataset_id=dataset.id,
        preprocessing_id=prep_config.id,
        model_name="Hardened Random Forest (Adversarial Training)",
        algorithm="random_forest",
        parameters_json=json.dumps(rf_params),
        model_file_path=def_model_path,
        clean_accuracy=adv_train_metrics["defended_clean_accuracy"],
        precision=clean_eval["precision"],
        recall=clean_eval["recall"],
        f1_score=clean_eval["f1_score"],
        training_duration=adv_train_metrics["training_duration"],
        feature_names_json=json.dumps(prep_pipeline.processed_feature_names_),
        target_classes_json=json.dumps(prep_pipeline.target_classes_),
        confusion_matrix_json=json.dumps(adv_train_metrics["confusion_matrix_after"])
    )
    db.add(defended_model)
    db.commit()
    db.refresh(defended_model)

    # 7. Record Experiment
    experiment = Experiment(
        user_id=user.id,
        dataset_id=dataset.id,
        model_id=trained_model.id,
        perturbation_method="bounded_perturbation",
        perturbation_strength=0.05,
        defence_method="adversarial_training",
        clean_accuracy=robust_eval["clean_accuracy"],
        robust_accuracy=robust_eval["robust_accuracy"],
        accuracy_drop=robust_eval["accuracy_drop"],
        relative_accuracy_drop=robust_eval["relative_accuracy_drop"],
        attack_success_rate=robust_eval["attack_success_rate"],
        prediction_flip_rate=robust_eval["prediction_flip_rate"],
        confidence_drop=robust_eval["confidence_drop"],
        defended_clean_accuracy=adv_train_metrics["defended_clean_accuracy"],
        defended_robust_accuracy=adv_train_metrics["defended_robust_accuracy"],
        defended_accuracy=adv_train_metrics["defended_robust_accuracy"],
        robustness_improvement=adv_train_metrics["robustness_improvement"],
        attack_reduction=adv_train_metrics["attack_reduction"],
        metadata_json=json.dumps({
            "strength_sweep": robust_eval["strength_sweep"],
            "feature_sensitivity": robust_eval["feature_sensitivity"][:8],
            "confusion_matrix_clean": robust_eval["confusion_matrix_clean"],
            "confusion_matrix_perturbed": robust_eval["confusion_matrix_perturbed"],
            "confusion_matrix_defended": adv_train_metrics["confusion_matrix_after"]
        })
    )
    db.add(experiment)
    db.commit()
    db.refresh(experiment)

    # Store first 50 sample results
    for s in robust_eval["sample_results"][:50]:
        res = ExperimentResult(
            experiment_id=experiment.id,
            sample_index=s["sample_index"],
            true_label=s["true_label"],
            clean_prediction=s["clean_prediction"],
            perturbed_prediction=s["perturbed_prediction"],
            clean_confidence=s["clean_confidence"],
            perturbed_confidence=s["perturbed_confidence"],
            prediction_changed=s["prediction_changed"]
        )
        db.add(res)
    db.commit()

    return {
        "success": True,
        "message": "Demo Experiment executed successfully!",
        "dataset_name": dataset.name,
        "model_name": trained_model.model_name,
        "clean_accuracy": robust_eval["clean_accuracy"],
        "robust_accuracy": robust_eval["robust_accuracy"],
        "accuracy_drop": robust_eval["accuracy_drop"],
        "attack_success_rate": robust_eval["attack_success_rate"],
        "defence_method": "Adversarial Training",
        "defended_robust_accuracy": adv_train_metrics["defended_robust_accuracy"],
        "robustness_improvement": adv_train_metrics["robustness_improvement"],
        "attack_reduction": adv_train_metrics["attack_reduction"],
        "experiment_id": experiment.id,
        "model_id": trained_model.id,
        "defended_model_id": defended_model.id,
        "strength_sweep": robust_eval["strength_sweep"],
        "feature_sensitivity": robust_eval["feature_sensitivity"][:6],
        "confusion_matrix_clean": robust_eval["confusion_matrix_clean"],
        "confusion_matrix_perturbed": robust_eval["confusion_matrix_perturbed"],
        "confusion_matrix_defended": adv_train_metrics["confusion_matrix_after"],
        "classes": prep_pipeline.target_classes_
    }
