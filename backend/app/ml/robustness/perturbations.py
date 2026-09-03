import numpy as np
from typing import Dict, Any, List, Optional, Tuple

def validate_perturbed_samples(
    X_perturbed: np.ndarray,
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str]
) -> np.ndarray:
    """
    Enforces strict mathematical validity constraints on perturbed feature vectors:
    1. Clips numeric values to observed [min, max] bounds.
    2. Enforces non-negativity for features that cannot be negative.
    3. Preserves integer data types by rounding integer-marked features.
    4. Ensures no NaNs or Infinities exist.
    """
    X_clean = np.nan_to_num(X_perturbed, nan=0.0, posinf=1e6, neginf=-1e6)
    
    for i, name in enumerate(feature_names):
        bounds = feature_bounds.get(name, {})
        col_min = bounds.get("min", None)
        col_max = bounds.get("max", None)
        is_int = bounds.get("is_int", False)
        non_neg = bounds.get("non_negative", False)

        # Clip bounds
        if col_min is not None and col_max is not None:
            # Allow slight margin (+/- 5%) if normalized, but clip to valid bounds
            X_clean[:, i] = np.clip(X_clean[:, i], col_min, col_max)
        elif col_min is not None:
            X_clean[:, i] = np.maximum(X_clean[:, i], col_min)

        if non_neg:
            X_clean[:, i] = np.maximum(X_clean[:, i], 0.0)

        if is_int:
            X_clean[:, i] = np.round(X_clean[:, i])

    return X_clean

def apply_random_noise(
    X: np.ndarray,
    strength: float, # e.g. 0.05 for 5%
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str],
    random_seed: int = 42
) -> np.ndarray:
    """Random uniform feature perturbation scaled by observed feature range."""
    rng = np.random.RandomState(random_seed)
    X_adv = X.copy()

    for i, name in enumerate(feature_names):
        bounds = feature_bounds.get(name, {})
        col_min = bounds.get("min", float(np.min(X[:, i])))
        col_max = bounds.get("max", float(np.max(X[:, i])))
        col_range = max(1e-5, col_max - col_min)
        
        noise = rng.uniform(-strength, strength, size=len(X)) * col_range
        X_adv[:, i] += noise

    return validate_perturbed_samples(X_adv, feature_bounds, feature_names)

def apply_gaussian_noise(
    X: np.ndarray,
    strength: float, # standard deviation scale factor e.g. 0.05
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str],
    random_seed: int = 42
) -> np.ndarray:
    """Gaussian noise perturbation scaled by feature standard deviation."""
    rng = np.random.RandomState(random_seed)
    X_adv = X.copy()

    for i, name in enumerate(feature_names):
        bounds = feature_bounds.get(name, {})
        std = bounds.get("std", float(np.std(X[:, i])))
        std = max(1e-5, std)

        noise = rng.normal(loc=0.0, scale=strength * std, size=len(X))
        X_adv[:, i] += noise

    return validate_perturbed_samples(X_adv, feature_bounds, feature_names)

def apply_bounded_perturbation(
    X: np.ndarray,
    epsilon: float, # e.g. 0.01, 0.05, 0.10
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str],
    random_seed: int = 42
) -> np.ndarray:
    """Epsilon-bounded feature perturbation targeting high-variance directions."""
    rng = np.random.RandomState(random_seed)
    X_adv = X.copy()

    for i, name in enumerate(feature_names):
        bounds = feature_bounds.get(name, {})
        col_min = bounds.get("min", float(np.min(X[:, i])))
        col_max = bounds.get("max", float(np.max(X[:, i])))
        col_range = max(1e-5, col_max - col_min)

        direction = rng.choice([-1.0, 1.0], size=len(X))
        delta = direction * (epsilon * col_range)
        X_adv[:, i] += delta

    return validate_perturbed_samples(X_adv, feature_bounds, feature_names)

def apply_feature_masking(
    X: np.ndarray,
    mask_count: int,
    replacement: str, # "median", "mean", or "zero"
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str],
    random_seed: int = 42
) -> np.ndarray:
    """Randomly masks a number of features per sample with their median, mean, or zero."""
    rng = np.random.RandomState(random_seed)
    X_adv = X.copy()
    n_samples, n_features = X.shape
    k = min(mask_count, n_features)

    # Precompute replacement values
    replacements = np.zeros(n_features)
    for i, name in enumerate(feature_names):
        bounds = feature_bounds.get(name, {})
        if replacement == "median":
            replacements[i] = bounds.get("mean", np.median(X[:, i])) # fallback to mean/median
        elif replacement == "mean":
            replacements[i] = bounds.get("mean", np.mean(X[:, i]))
        else: # zero
            replacements[i] = 0.0

    for row in range(n_samples):
        masked_indices = rng.choice(n_features, size=k, replace=False)
        X_adv[row, masked_indices] = replacements[masked_indices]

    return validate_perturbed_samples(X_adv, feature_bounds, feature_names)

def run_feature_dropout_sensitivity(
    classifier: Any,
    X: np.ndarray,
    y: np.ndarray,
    feature_bounds: Dict[str, Dict[str, Any]],
    feature_names: List[str]
) -> List[Dict[str, Any]]:
    """Evaluates classifier sensitivity to each individual feature by neutralizing it."""
    from sklearn.metrics import accuracy_score
    clean_acc = accuracy_score(y, classifier.predict(X))
    sensitivity_list = []

    for i, name in enumerate(feature_names):
        X_dropped = X.copy()
        bounds = feature_bounds.get(name, {})
        neutral_val = bounds.get("mean", float(np.mean(X[:, i])))
        X_dropped[:, i] = neutral_val

        dropped_acc = accuracy_score(y, classifier.predict(X_dropped))
        impact_drop = max(0.0, clean_acc - dropped_acc)
        sensitivity_list.append({
            "feature_name": name,
            "accuracy_without_feature": round(float(dropped_acc), 4),
            "impact_drop": round(float(impact_drop), 4)
        })

    # Sort descending by sensitivity (highest impact first)
    sensitivity_list.sort(key=lambda x: x["impact_drop"], reverse=True)
    return sensitivity_list
