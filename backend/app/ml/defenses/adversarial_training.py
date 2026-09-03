import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.metrics import accuracy_score, confusion_matrix
from backend.app.ml.robustness.perturbations import apply_bounded_perturbation
from backend.app.ml.training.trainer import create_classifier, train_and_time_classifier

def perform_adversarial_training(
    algorithm: str,
    parameters: Dict[str, Any],
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str],
    target_classes: List[str],
    original_model: Any,
    augmentation_ratio: float = 0.25,
    perturbation_strength: float = 0.05,
    random_seed: int = 42
) -> Tuple[Any, Dict[str, Any]]:
    """Augments training dataset with bounded adversarial perturbations and retrains model."""
    rng = np.random.RandomState(random_seed)
    n_train = len(X_train)
    n_aug = int(n_train * augmentation_ratio)

    # 1. Select random training subset to perturb
    aug_indices = rng.choice(n_train, size=n_aug, replace=False)
    X_aug_sub = X_train[aug_indices]
    y_aug_sub = y_train[aug_indices]

    # 2. Perturb training subset
    X_aug_pert = apply_bounded_perturbation(
        X_aug_sub,
        epsilon=perturbation_strength,
        feature_bounds=feature_bounds,
        feature_names=feature_names,
        random_seed=random_seed
    )

    # 3. Concatenate robust training set
    X_train_defended = np.vstack([X_train, X_aug_pert])
    y_train_defended = np.concatenate([y_train, y_aug_sub])

    # 4. Train new defended classifier
    defended_classifier = create_classifier(algorithm, parameters)
    defended_classifier, train_time = train_and_time_classifier(
        defended_classifier, X_train_defended, y_train_defended
    )

    # 5. Generate test perturbation for evaluation
    X_test_adv = apply_bounded_perturbation(
        X_test,
        epsilon=perturbation_strength,
        feature_bounds=feature_bounds,
        feature_names=feature_names,
        random_seed=random_seed
    )

    # 6. Evaluate original model
    y_clean_orig = original_model.predict(X_test)
    y_adv_orig = original_model.predict(X_test_adv)
    orig_clean_acc = float(accuracy_score(y_test, y_clean_orig))
    orig_robust_acc = float(accuracy_score(y_test, y_adv_orig))
    orig_correct = (y_clean_orig == y_test)
    orig_asr = float((np.sum(orig_correct & (y_adv_orig != y_test)) / max(1, np.sum(orig_correct))) * 100.0)

    # 7. Evaluate defended model
    y_clean_def = defended_classifier.predict(X_test)
    y_adv_def = defended_classifier.predict(X_test_adv)
    def_clean_acc = float(accuracy_score(y_test, y_clean_def))
    def_robust_acc = float(accuracy_score(y_test, y_adv_def))
    def_correct = (y_clean_def == y_test)
    def_asr = float((np.sum(def_correct & (y_adv_def != y_test)) / max(1, np.sum(def_correct))) * 100.0)

    # 8. Improvement metrics
    robustness_improvement = round(def_robust_acc - orig_robust_acc, 4)
    attack_reduction = round(orig_asr - def_asr, 2)

    cm_before = confusion_matrix(y_test, y_adv_orig).tolist()
    cm_after = confusion_matrix(y_test, y_adv_def).tolist()

    metrics = {
        "augmentation_ratio": augmentation_ratio,
        "perturbation_strength": perturbation_strength,
        "original_clean_accuracy": round(orig_clean_acc, 4),
        "original_robust_accuracy": round(orig_robust_acc, 4),
        "original_attack_success_rate": round(orig_asr, 2),
        "defended_clean_accuracy": round(def_clean_acc, 4),
        "defended_robust_accuracy": round(def_robust_acc, 4),
        "defended_attack_success_rate": round(def_asr, 2),
        "robustness_improvement": robustness_improvement,
        "attack_reduction": attack_reduction,
        "confusion_matrix_before": cm_before,
        "confusion_matrix_after": cm_after,
        "classes": target_classes,
        "training_duration": train_time
    }

    return defended_classifier, metrics
