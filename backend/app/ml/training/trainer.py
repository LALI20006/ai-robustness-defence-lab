import time
import joblib
import numpy as np
from typing import Dict, Any, Tuple, Optional
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

def create_classifier(algorithm: str, parameters: Optional[Dict[str, Any]] = None):
    """Model factory returning configured scikit-learn classifier with safe defaults."""
    params = parameters or {}
    algo = algorithm.lower().strip()

    if algo in ["logistic_regression", "lr"]:
        C = float(params.get("C", 1.0))
        max_iter = int(params.get("max_iter", 1000))
        solver = params.get("solver", "lbfgs")
        return LogisticRegression(C=C, max_iter=max_iter, solver=solver, random_state=42)

    elif algo in ["decision_tree", "dt"]:
        max_depth = params.get("max_depth", None)
        if max_depth is not None:
            max_depth = int(max_depth)
        min_samples_split = int(params.get("min_samples_split", 2))
        criterion = params.get("criterion", "gini")
        return DecisionTreeClassifier(max_depth=max_depth, min_samples_split=min_samples_split, criterion=criterion, random_state=42)

    elif algo in ["random_forest", "rf"]:
        n_estimators = int(params.get("n_estimators", 100))
        max_depth = params.get("max_depth", None)
        if max_depth is not None:
            max_depth = int(max_depth)
        min_samples_split = int(params.get("min_samples_split", 2))
        class_weight = params.get("class_weight", None)
        return RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            class_weight=class_weight,
            random_state=42,
            n_jobs=-1
        )

    elif algo in ["svm", "support_vector_machine"]:
        C = float(params.get("C", 1.0))
        kernel = params.get("kernel", "rbf")
        gamma = params.get("gamma", "scale")
        # probability=True is needed for confidence scores and soft voting
        return SVC(C=C, kernel=kernel, gamma=gamma, probability=True, random_state=42)

    elif algo in ["knn", "k_nearest_neighbors"]:
        n_neighbors = int(params.get("n_neighbors", 5))
        weights = params.get("weights", "uniform")
        metric = params.get("metric", "minkowski")
        return KNeighborsClassifier(n_neighbors=n_neighbors, weights=weights, metric=metric, n_jobs=-1)

    elif algo in ["gradient_boosting", "gb"]:
        n_estimators = int(params.get("n_estimators", 100))
        learning_rate = float(params.get("learning_rate", 0.1))
        max_depth = int(params.get("max_depth", 3))
        return GradientBoostingClassifier(n_estimators=n_estimators, learning_rate=learning_rate, max_depth=max_depth, random_state=42)

    elif algo in ["mlp", "mlp_classifier", "neural_network"]:
        hidden_units = params.get("hidden_layer_sizes", (64, 32))
        if isinstance(hidden_units, list):
            hidden_units = tuple(hidden_units)
        activation = params.get("activation", "relu")
        max_iter = int(params.get("max_iter", 300))
        return MLPClassifier(hidden_layer_sizes=hidden_units, activation=activation, max_iter=max_iter, random_state=42)

    else:
        raise ValueError(f"Unsupported algorithm: {algorithm}. Supported: logistic_regression, decision_tree, random_forest, svm, knn, gradient_boosting, mlp")

def train_and_time_classifier(
    classifier,
    X_train: np.ndarray,
    y_train: np.ndarray
) -> Tuple[Any, float]:
    """Fits classifier and measures duration."""
    start = time.time()
    classifier.fit(X_train, y_train)
    duration = time.time() - start
    return classifier, round(duration, 3)

def save_model_artifact(
    model: Any,
    file_path: str,
    metadata: Dict[str, Any]
):
    """Saves serialized model bundled with metadata dict."""
    payload = {
        "model": model,
        "metadata": metadata
    }
    joblib.dump(payload, file_path)

def load_model_artifact(file_path: str) -> Tuple[Any, Dict[str, Any]]:
    """Loads serialized model and metadata."""
    payload = joblib.load(file_path)
    return payload["model"], payload["metadata"]
