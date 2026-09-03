import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.metrics import accuracy_score, confusion_matrix
from backend.app.ml.robustness.perturbations import (
    apply_random_noise,
    apply_gaussian_noise,
    apply_bounded_perturbation,
    apply_feature_masking,
    run_feature_dropout_sensitivity
)

def run_robustness_evaluation(
    classifier: Any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str],
    target_classes: List[str],
    perturbation_method: str = "bounded_perturbation",
    perturbation_strength: float = 0.05,
    mask_count: int = 3,
    mask_replacement: str = "median",
    random_seed: int = 42
) -> Dict[str, Any]:
    """Runs controlled adversarial evaluation and calculates standardized robustness metrics."""
    has_proba = hasattr(classifier, "predict_proba")
    
    # 1. Clean predictions & confidences
    y_clean_pred = classifier.predict(X_test)
    clean_acc = float(accuracy_score(y_test, y_clean_pred))
    
    if has_proba:
        clean_probas = classifier.predict_proba(X_test)
        clean_confs = np.max(clean_probas, axis=1)
    else:
        clean_confs = np.ones(len(y_clean_pred))

    # 2. Generate perturbed samples based on selected method
    method = perturbation_method.lower()
    if method == "random_noise":
        X_adv = apply_random_noise(X_test, perturbation_strength, feature_bounds, feature_names, random_seed)
    elif method == "gaussian_noise":
        X_adv = apply_gaussian_noise(X_test, perturbation_strength, feature_bounds, feature_names, random_seed)
    elif method == "feature_masking":
        X_adv = apply_feature_masking(X_test, mask_count, mask_replacement, feature_bounds, feature_names, random_seed)
    elif method == "feature_dropout":
        # Feature dropout doesn't perturb the whole matrix at once; default to small bounded perturbation for overall stats
        X_adv = apply_bounded_perturbation(X_test, perturbation_strength, feature_bounds, feature_names, random_seed)
    else: # default bounded_perturbation
        X_adv = apply_bounded_perturbation(X_test, perturbation_strength, feature_bounds, feature_names, random_seed)

    # 3. Perturbed predictions & confidences
    y_adv_pred = classifier.predict(X_adv)
    robust_acc = float(accuracy_score(y_test, y_adv_pred))
    
    if has_proba:
        adv_probas = classifier.predict_proba(X_adv)
        adv_confs = np.max(adv_probas, axis=1)
    else:
        adv_confs = np.ones(len(y_adv_pred))

    # 4. Metric Calculations
    acc_drop = max(0.0, clean_acc - robust_acc)
    rel_acc_drop = ((clean_acc - robust_acc) / clean_acc * 100.0) if clean_acc > 0 else 0.0

    # Prediction Flip Rate: % of all samples where prediction changed
    prediction_changed_mask = (y_clean_pred != y_adv_pred)
    prediction_flip_rate = float(np.mean(prediction_changed_mask) * 100.0)

    # Attack Success Rate (ASR): % of originally correct samples that become incorrect
    originally_correct_mask = (y_clean_pred == y_test)
    num_originally_correct = np.sum(originally_correct_mask)
    if num_originally_correct > 0:
        flipped_to_incorrect = np.sum(originally_correct_mask & (y_adv_pred != y_test))
        asr = float((flipped_to_incorrect / num_originally_correct) * 100.0)
    else:
        asr = 0.0

    # Confidence Drop: average decrease in confidence for originally correct predictions
    if has_proba and num_originally_correct > 0:
        conf_drop = float(np.mean(np.maximum(0.0, clean_confs[originally_correct_mask] - adv_confs[originally_correct_mask])))
    else:
        conf_drop = 0.0

    # Confusion matrices
    cm_clean = confusion_matrix(y_test, y_clean_pred).tolist()
    cm_perturbed = confusion_matrix(y_test, y_adv_pred).tolist()

    # Per-sample results
    sample_results = []
    for i in range(len(y_test)):
        sample_results.append({
            "sample_index": i,
            "true_label": target_classes[int(y_test[i])] if int(y_test[i]) < len(target_classes) else str(y_test[i]),
            "clean_prediction": target_classes[int(y_clean_pred[i])] if int(y_clean_pred[i]) < len(target_classes) else str(y_clean_pred[i]),
            "perturbed_prediction": target_classes[int(y_adv_pred[i])] if int(y_adv_pred[i]) < len(target_classes) else str(y_adv_pred[i]),
            "clean_confidence": round(float(clean_confs[i]), 3) if has_proba else None,
            "perturbed_confidence": round(float(adv_confs[i]), 3) if has_proba else None,
            "prediction_changed": bool(prediction_changed_mask[i])
        })

    # Strength sweep: compute accuracy drop curve across 1%, 2%, 5%, 10%, 15%
    strength_sweep = []
    sweep_strengths = [0.01, 0.02, 0.05, 0.10, 0.15]
    for s in sweep_strengths:
        if method == "gaussian_noise":
            X_s = apply_gaussian_noise(X_test, s, feature_bounds, feature_names, random_seed)
        elif method == "random_noise":
            X_s = apply_random_noise(X_test, s, feature_bounds, feature_names, random_seed)
        else:
            X_s = apply_bounded_perturbation(X_test, s, feature_bounds, feature_names, random_seed)
        y_s_pred = classifier.predict(X_s)
        s_acc = float(accuracy_score(y_test, y_s_pred))
        s_asr = float((np.sum(originally_correct_mask & (y_s_pred != y_test)) / num_originally_correct * 100.0)) if num_originally_correct > 0 else 0.0
        strength_sweep.append({
            "strength": s,
            "strength_pct": f"{int(s * 100)}%",
            "robust_accuracy": round(s_acc, 4),
            "attack_success_rate": round(s_asr, 2),
            "accuracy_drop": round(clean_acc - s_acc, 4)
        })

    # Feature sensitivity ranking
    sensitivity_list = run_feature_dropout_sensitivity(classifier, X_test, y_test, feature_bounds, feature_names)

    return {
        "clean_accuracy": round(clean_acc, 4),
        "robust_accuracy": round(robust_acc, 4),
        "accuracy_drop": round(acc_drop, 4),
        "relative_accuracy_drop": round(rel_acc_drop, 2),
        "attack_success_rate": round(asr, 2),
        "prediction_flip_rate": round(prediction_flip_rate, 2),
        "confidence_drop": round(conf_drop, 4),
        "confusion_matrix_clean": cm_clean,
        "confusion_matrix_perturbed": cm_perturbed,
        "classes": target_classes,
        "sample_results": sample_results,
        "strength_sweep": strength_sweep,
        "feature_sensitivity": sensitivity_list
    }
