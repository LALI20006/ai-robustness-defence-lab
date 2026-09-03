import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, OneHotEncoder, LabelEncoder
from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif
from backend.app.config import settings

class PreprocessingPipeline:
    def __init__(
        self,
        missing_value_strategy: str = "mean",
        encoding_method: str = "onehot",
        scaling_method: str = "standard",
        feature_selection_method: str = "all",
        selected_features: Optional[List[str]] = None,
        k_best: Optional[int] = 10,
        variance_threshold: Optional[float] = 0.01,
        test_size: float = 0.20,
        random_seed: int = 42
    ):
        self.missing_value_strategy = missing_value_strategy
        self.encoding_method = encoding_method
        self.scaling_method = scaling_method
        self.feature_selection_method = feature_selection_method
        self.selected_features = selected_features
        self.k_best = k_best
        self.variance_threshold = variance_threshold
        self.test_size = test_size
        self.random_seed = random_seed

        # Fitted components
        self.imputers: Dict[str, Any] = {}
        self.encoder: Optional[OneHotEncoder] = None
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.target_encoder: Optional[LabelEncoder] = None
        self.scaler: Optional[Any] = None
        self.selector: Optional[Any] = None
        
        # Metadata
        self.raw_feature_names: List[str] = []
        self.numeric_features: List[str] = []
        self.categorical_features: List[str] = []
        self.target_column: str = ""
        self.target_classes_: List[str] = []
        self.processed_feature_names_: List[str] = []
        self.feature_bounds_: Dict[str, Dict[str, Any]] = {} # min, max, is_int, non_negative

    def fit_transform(self, df: pd.DataFrame, target_col: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, Dict[str, Any]]:
        self.target_column = target_col
        df = df.copy()

        # Remove duplicate rows
        orig_row_count = len(df)
        df = df.drop_duplicates()
        removed_dups = orig_row_count - len(df)

        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in dataset.")

        # Drop rows where target is missing
        df = df.dropna(subset=[target_col])
        if len(df) < 10:
            raise ValueError("Dataset has too few valid rows (< 10) after cleaning.")

        # Separate X and y
        y_raw = df[target_col].astype(str)
        X_df = df.drop(columns=[target_col])

        # Drop all-null columns
        empty_cols = [c for c in X_df.columns if X_df[c].isna().all()]
        if empty_cols:
            X_df = X_df.drop(columns=empty_cols)

        # Encode target classes
        self.target_encoder = LabelEncoder()
        y = self.target_encoder.fit_transform(y_raw)
        self.target_classes_ = [str(c) for c in self.target_encoder.classes_]

        if len(self.target_classes_) < 2:
            raise ValueError("Target column must have at least 2 distinct classes.")

        # Stratified train/test split before fitting transformers
        try:
            X_train_df, X_test_df, y_train, y_test = train_test_split(
                X_df, y, test_size=self.test_size, random_state=self.random_seed, stratify=y
            )
        except ValueError:
            # Fallback if class counts too small for stratified
            X_train_df, X_test_df, y_train, y_test = train_test_split(
                X_df, y, test_size=self.test_size, random_state=self.random_seed
            )

        # Identify numeric vs categorical
        self.raw_feature_names = list(X_train_df.columns)
        self.numeric_features = list(X_train_df.select_dtypes(include=[np.number]).columns)
        self.categorical_features = [c for c in self.raw_feature_names if c not in self.numeric_features]

        # 1. Handle Missing Values (fit on train)
        for col in self.numeric_features:
            if self.missing_value_strategy == "median":
                fill_val = float(X_train_df[col].median(skipna=True))
            else: # default mean
                fill_val = float(X_train_df[col].mean(skipna=True))
            if np.isnan(fill_val):
                fill_val = 0.0
            self.imputers[col] = fill_val
            X_train_df[col] = X_train_df[col].fillna(fill_val)
            X_test_df[col] = X_test_df[col].fillna(fill_val)

        for col in self.categorical_features:
            mode_series = X_train_df[col].mode(dropna=True)
            mode_val = str(mode_series.iloc[0]) if not mode_series.empty else "unknown"
            self.imputers[col] = mode_val
            X_train_df[col] = X_train_df[col].fillna(mode_val).astype(str)
            X_test_df[col] = X_test_df[col].fillna(mode_val).astype(str)

        # 2. Encoding Categorical Features
        encoded_train_parts = []
        encoded_test_parts = []
        feature_names = []

        if self.numeric_features:
            encoded_train_parts.append(X_train_df[self.numeric_features].values)
            encoded_test_parts.append(X_test_df[self.numeric_features].values)
            feature_names.extend(self.numeric_features)

        if self.categorical_features:
            if self.encoding_method == "onehot":
                self.encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
                train_cat = self.encoder.fit_transform(X_train_df[self.categorical_features])
                test_cat = self.encoder.transform(X_test_df[self.categorical_features])
                cat_feature_names = list(self.encoder.get_feature_names_out(self.categorical_features))
                encoded_train_parts.append(train_cat)
                encoded_test_parts.append(test_cat)
                feature_names.extend(cat_feature_names)
            else: # label encoding
                train_label_cols = []
                test_label_cols = []
                for col in self.categorical_features:
                    le = LabelEncoder()
                    le.fit(pd.concat([X_train_df[col], X_test_df[col]], axis=0))
                    self.label_encoders[col] = le
                    train_label_cols.append(le.transform(X_train_df[col])[:, None])
                    test_label_cols.append(le.transform(X_test_df[col])[:, None])
                encoded_train_parts.append(np.hstack(train_label_cols))
                encoded_test_parts.append(np.hstack(test_label_cols))
                feature_names.extend(self.categorical_features)

        X_train_arr = np.hstack(encoded_train_parts).astype(np.float64)
        X_test_arr = np.hstack(encoded_test_parts).astype(np.float64)

        # 3. Feature Scaling
        if self.scaling_method == "standard":
            self.scaler = StandardScaler()
            X_train_arr = self.scaler.fit_transform(X_train_arr)
            X_test_arr = self.scaler.transform(X_test_arr)
        elif self.scaling_method == "minmax":
            self.scaler = MinMaxScaler()
            X_train_arr = self.scaler.fit_transform(X_train_arr)
            X_test_arr = self.scaler.transform(X_test_arr)
        elif self.scaling_method == "robust":
            self.scaler = RobustScaler()
            X_train_arr = self.scaler.fit_transform(X_train_arr)
            X_test_arr = self.scaler.transform(X_test_arr)
        else:
            self.scaler = None

        # 4. Feature Selection
        current_names = list(feature_names)
        if self.feature_selection_method == "variance":
            self.selector = VarianceThreshold(threshold=self.variance_threshold or 0.01)
            X_train_arr = self.selector.fit_transform(X_train_arr)
            X_test_arr = self.selector.transform(X_test_arr)
            mask = self.selector.get_support()
            current_names = [name for name, keep in zip(current_names, mask) if keep]
        elif self.feature_selection_method == "selectkbest":
            k = min(self.k_best or 10, X_train_arr.shape[1])
            self.selector = SelectKBest(score_func=f_classif, k=k)
            X_train_arr = self.selector.fit_transform(X_train_arr, y_train)
            X_test_arr = self.selector.transform(X_test_arr)
            mask = self.selector.get_support()
            current_names = [name for name, keep in zip(current_names, mask) if keep]
        elif self.feature_selection_method == "manual" and self.selected_features:
            keep_indices = [i for i, name in enumerate(current_names) if name in self.selected_features]
            if keep_indices:
                X_train_arr = X_train_arr[:, keep_indices]
                X_test_arr = X_test_arr[:, keep_indices]
                current_names = [current_names[i] for i in keep_indices]

        self.processed_feature_names_ = current_names

        # Compute observed mathematical feature bounds on transformed training data
        for i, name in enumerate(self.processed_feature_names_):
            col_vals = X_train_arr[:, i]
            min_val = float(np.min(col_vals))
            max_val = float(np.max(col_vals))
            # Check if strictly integer-like
            is_int = bool(np.all(np.equal(np.mod(col_vals, 1), 0)))
            non_negative = bool(min_val >= 0)
            self.feature_bounds_[name] = {
                "min": min_val,
                "max": max_val,
                "is_int": is_int,
                "non_negative": non_negative,
                "std": float(np.std(col_vals)),
                "mean": float(np.mean(col_vals))
            }

        target_dist = {str(k): int(v) for k, v in zip(*np.unique(y_raw, return_counts=True))}

        summary = {
            "original_row_count": orig_row_count,
            "final_row_count": len(df),
            "removed_duplicates": removed_dups,
            "original_feature_count": len(X_df.columns),
            "final_feature_count": len(self.processed_feature_names_),
            "train_size": len(X_train_arr),
            "test_size": len(X_test_arr),
            "encoding_method": self.encoding_method,
            "scaling_method": self.scaling_method,
            "target_distribution": target_dist
        }

        return X_train_arr, X_test_arr, y_train, y_test, summary

    def save(self, file_path: str):
        joblib.dump(self, file_path)

    @classmethod
    def load(cls, file_path: str) -> "PreprocessingPipeline":
        return joblib.load(file_path)

def load_dataframe(file_path: str) -> pd.DataFrame:
    """Safely loads CSV, TSV, or Parquet tabular files."""
    if file_path.endswith(".parquet"):
        return pd.read_parquet(file_path)
    elif file_path.endswith(".tsv"):
        return pd.read_csv(file_path, sep="\t")
    return pd.read_csv(file_path)

def inspect_dataset_preview(file_path: str, max_rows: int = 10) -> Dict[str, Any]:
    """Helper to parse a tabular dataset and compute column-level previews & stats."""
    df = load_dataframe(file_path)
    total_rows = len(df)
    total_cols = len(df.columns)
    columns = list(df.columns)

    # Detect candidate target column
    target_candidate = None
    potential_names = ["label", "class", "target", "attack", "malware", "status", "category", "result"]
    for c in columns:
        if c.lower() in potential_names:
            target_candidate = c
            break
    if not target_candidate:
        # Check column with few unique values
        for c in reversed(columns):
            if 2 <= df[c].nunique() <= 10:
                target_candidate = c
                break
    if not target_candidate and columns:
        target_candidate = columns[-1]

    col_types = {}
    for c in columns:
        if pd.api.types.is_numeric_dtype(df[c]):
            col_types[c] = "numeric"
        else:
            col_types[c] = "categorical"

    preview_data = df.head(max_rows).replace({np.nan: None}).to_dict(orient="records")

    return {
        "total_rows": total_rows,
        "total_columns": total_cols,
        "columns": columns,
        "target_column": target_candidate,
        "column_types": col_types,
        "data": preview_data
    }

def compute_dataset_statistics(file_path: str, target_col: Optional[str] = None) -> Dict[str, Any]:
    """Computes comprehensive statistics for dataset preview."""
    df = load_dataframe(file_path)
    total_rows = len(df)
    total_cols = len(df.columns)
    columns = list(df.columns)

    numeric_cols = list(df.select_dtypes(include=[np.number]).columns)
    categorical_cols = [c for c in columns if c not in numeric_cols]

    columns_stats = []
    for c in columns:
        missing_cnt = int(df[c].isna().sum())
        missing_pct = round((missing_cnt / total_rows) * 100, 2) if total_rows > 0 else 0.0
        unique_cnt = int(df[c].nunique())
        dtype_str = "numeric" if c in numeric_cols else "categorical"

        stat = {
            "name": c,
            "dtype": dtype_str,
            "missing_count": missing_cnt,
            "missing_pct": missing_pct,
            "unique_count": unique_cnt,
            "sample_values": [str(x) for x in df[c].dropna().unique()[:5]]
        }
        if c in numeric_cols:
            stat["mean"] = round(float(df[c].mean()), 3) if not df[c].isna().all() else None
            stat["std"] = round(float(df[c].std()), 3) if not df[c].isna().all() else None
            stat["min"] = round(float(df[c].min()), 3) if not df[c].isna().all() else None
            stat["max"] = round(float(df[c].max()), 3) if not df[c].isna().all() else None
        columns_stats.append(stat)

    class_distribution = {}
    if target_col and target_col in df.columns:
        counts = df[target_col].value_counts()
        class_distribution = {str(k): int(v) for k, v in counts.items()}

    return {
        "total_rows": total_rows,
        "total_columns": total_cols,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "target_column": target_col,
        "class_distribution": class_distribution,
        "columns_stats": columns_stats
    }
