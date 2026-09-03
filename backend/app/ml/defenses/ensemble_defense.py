import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import accuracy_score
from backend.app.ml.robustness.perturbations import apply_bounded_perturbation

def build_ensemble_defense(
    models_with_names: List[Tuple[str, Any]],
    voting: str = "soft",
    X_train: np.ndarray = None,
    y_train: np.ndarray = None,
    X_test: np.ndarray = None,
    y_test: np.ndarray = None,
    feature_bounds: Dict[str, Dict[str, Any]] = None,
    feature_names: List[str] = None,
    perturbation_strength: float = 0.05
) -> Tuple[Any, Dict[str, Any]]:
    """Constructs a voting ensemble classifier defense."""
    # Ensure all estimators support predict_proba if soft voting is requested
    supports_proba = all(hasattr(m, "predict_proba") for _, m in models_with_names)
    actual_voting = "soft" if (voting == "soft" and supports_proba) else "hard"

    ensemble = VotingClassifier(
        estimators=models_with_names,
        voting=actual_voting,
        n_jobs=-1
    )

    if X_train is not None and y_train is not None:
        ensemble.fit(X_train, y_train)

    # Evaluate on clean and perturbed test data if provided
    eval_metrics = {}
    if X_test is not None and y_test is not None and feature_bounds and feature_names:
        y_clean = ensemble.predict(X_test)
        clean_acc = float(accuracy_score(y_test, y_clean))

        X_adv = apply_bounded_perturbation(X_test, perturbation_strength, feature_bounds, feature_names)
        y_adv = ensemble.predict(X_adv)
        robust_acc = float(accuracy_score(y_test, y_adv))

        correct_mask = (y_clean == y_test)
        asr = float((np.sum(correct_mask & (y_adv != y_test)) / max(1, np.sum(correct_mask))) * 100.0)

        eval_metrics = {
            "voting_type": actual_voting,
            "component_count": len(models_with_names),
            "clean_accuracy": round(clean_acc, 4),
            "robust_accuracy": round(robust_acc, 4),
            "attack_success_rate": round(asr, 2),
            "accuracy_drop": round(clean_acc - robust_acc, 4)
        }

    return ensemble, eval_metrics
