import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)

def evaluate_classifier(
    classifier: Any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    classes: List[str]
) -> Dict[str, Any]:
    """Computes rigorous clean evaluation metrics."""
    y_pred = classifier.predict(X_test)
    
    # Check probability capability
    has_proba = hasattr(classifier, "predict_proba")
    y_proba = classifier.predict_proba(X_test) if has_proba else None

    # Core metrics
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    cm_list = cm.tolist()

    # FPR and FNR (for binary or first class)
    fpr_val = None
    fnr_val = None
    if len(classes) == 2 and cm.shape == (2, 2):
        tn, fp, fn, tp = cm.ravel()
        fpr_val = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
        fnr_val = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    # ROC-AUC & ROC Curve data
    roc_auc_val = None
    roc_curve_data = None
    if has_proba and y_proba is not None:
        try:
            if len(classes) == 2:
                # Binary classification
                pos_probs = y_proba[:, 1]
                roc_auc_val = float(roc_auc_score(y_test, pos_probs))
                fpr, tpr, thresholds = roc_curve(y_test, pos_probs)
                
                # Sample down points if too many for smooth UI charts
                step = max(1, len(fpr) // 50)
                roc_curve_data = {
                    "fpr": [round(float(x), 4) for x in fpr[::step]],
                    "tpr": [round(float(x), 4) for x in tpr[::step]],
                    "thresholds": [round(float(x), 4) for x in thresholds[::step]]
                }
            else:
                # Multi-class
                roc_auc_val = float(roc_auc_score(y_test, y_proba, multi_class="ovr"))
        except Exception:
            roc_auc_val = None

    # Confidence distribution histogram
    confidence_distribution = None
    if has_proba and y_proba is not None:
        max_confidences = np.max(y_proba, axis=1)
        hist, bin_edges = np.histogram(max_confidences, bins=10, range=(0.0, 1.0))
        confidence_distribution = {
            "counts": hist.tolist(),
            "bins": [round(float(b), 2) for b in bin_edges[:-1]]
        }

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc_val, 4) if roc_auc_val is not None else None,
        "fpr": round(fpr_val, 4) if fpr_val is not None else None,
        "fnr": round(fnr_val, 4) if fnr_val is not None else None,
        "confusion_matrix": cm_list,
        "classes": classes,
        "roc_curve": roc_curve_data,
        "confidence_distribution": confidence_distribution
    }
