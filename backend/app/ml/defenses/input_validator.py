import numpy as np
from typing import Dict, Any, List

class InputValidatorDefense:
    def __init__(
        self,
        feature_bounds: Dict[str, Dict[str, Any]],
        feature_names: List[str],
        outlier_method: str = "iqr",
        strict_bounds: bool = True,
        reject_nans: bool = True
    ):
        self.feature_bounds = feature_bounds
        self.feature_names = feature_names
        self.outlier_method = outlier_method
        self.strict_bounds = strict_bounds
        self.reject_nans = reject_nans

    def validate_batch(self, X: np.ndarray) -> Dict[str, Any]:
        """Evaluates batch of inputs and tags each sample as VALID, WARNING, or REJECTED."""
        n_samples = len(X)
        results = []
        valid_cnt = 0
        warning_cnt = 0
        rejected_cnt = 0

        for idx in range(n_samples):
            row = X[idx]
            reasons = []
            status = "VALID"

            # 1. Check NaNs or Infinities
            if np.isnan(row).any() or np.isinf(row).any():
                if self.reject_nans:
                    status = "REJECTED"
                    reasons.append("Sample contains NaN or Infinity values")
                else:
                    status = "WARNING"
                    reasons.append("Sample contains NaN or Infinity values")

            # 2. Bound checks
            for col_idx, name in enumerate(self.feature_names):
                val = row[col_idx]
                bounds = self.feature_bounds.get(name, {})
                c_min = bounds.get("min", None)
                c_max = bounds.get("max", None)
                c_mean = bounds.get("mean", 0.0)
                c_std = max(1e-5, bounds.get("std", 1.0))
                non_neg = bounds.get("non_negative", False)

                if non_neg and val < 0.0:
                    status = "REJECTED"
                    reasons.append(f"Feature '{name}' violated non-negativity constraint ({val:.3f} < 0)")

                if c_min is not None and c_max is not None:
                    # Check range exceedance with buffer
                    margin = (c_max - c_min) * 0.2
                    if val < (c_min - margin) or val > (c_max + margin):
                        if status != "REJECTED":
                            status = "WARNING"
                        reasons.append(f"Feature '{name}' exceeded expected range [{c_min:.2f}, {c_max:.2f}]")

                # Statistical Outlier check (Z-Score > 4)
                z_score = abs(val - c_mean) / c_std
                if z_score > 4.0:
                    if status == "VALID":
                        status = "WARNING"
                    reasons.append(f"Extreme statistical outlier on '{name}' (z-score: {z_score:.1f})")

            if status == "VALID":
                valid_cnt += 1
            elif status == "WARNING":
                warning_cnt += 1
            else:
                rejected_cnt += 1

            # Store only samples with warnings/rejections or first few valid samples
            if status != "VALID" or idx < 15:
                results.append({
                    "sample_index": idx,
                    "status": status,
                    "reasons": reasons if reasons else ["Passed all sanity and range validation rules"]
                })

        return {
            "total_samples": n_samples,
            "valid_count": valid_cnt,
            "warning_count": warning_cnt,
            "rejected_count": rejected_cnt,
            "validation_rate": round((valid_cnt / n_samples) * 100.0, 2) if n_samples > 0 else 0.0,
            "rejection_rate": round((rejected_cnt / n_samples) * 100.0, 2) if n_samples > 0 else 0.0,
            "details": results[:100]
        }
