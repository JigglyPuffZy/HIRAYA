"""Train Random Forest, XGBoost, and LightGBM models and select a champion."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from app.ml.feature_builder import FEATURE_COLUMNS, load_training_frame


def _evaluate(model, x_test: pd.DataFrame, y_test: pd.Series) -> dict[str, float]:
    probabilities = model.predict_proba(x_test)[:, 1]
    predictions = (probabilities >= 0.5).astype(int)
    return {
        "roc_auc": float(roc_auc_score(y_test, probabilities)),
        "f1": float(f1_score(y_test, predictions)),
    }


def train_all_models(csv_path: str, output_dir: Path) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)

    features, target = load_training_frame(csv_path)
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=0.2,
        random_state=42,
        stratify=target,
    )

    candidates = {
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1,
        ),
        "xgboost": XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=42,
        ),
        "lightgbm": lgb.LGBMClassifier(
            n_estimators=300,
            learning_rate=0.05,
            num_leaves=31,
            random_state=42,
            class_weight="balanced",
        ),
    }

    metrics: dict[str, dict[str, float]] = {}
    version = datetime.now(timezone.utc).strftime("%Y%m%d.%H%M%S")

    for name, model in candidates.items():
        model.fit(x_train, y_train)
        model_metrics = _evaluate(model, x_test, y_test)
        metrics[name] = model_metrics

        artifact = {
            "model": model,
            "feature_columns": FEATURE_COLUMNS,
            "model_name": name,
            "model_version": version,
            "metrics": model_metrics,
        }
        joblib.dump(artifact, output_dir / f"{name}.joblib")

    champion_name = max(metrics, key=lambda key: (metrics[key]["roc_auc"], metrics[key]["f1"]))
    champion_path = output_dir / f"{champion_name}.joblib"
    champion_copy = output_dir / "champion.joblib"
    champion_copy.write_bytes(champion_path.read_bytes())

    manifest = {
        "modelVersion": version,
        "champion": champion_name,
        "metrics": metrics,
        "featureColumns": FEATURE_COLUMNS,
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "trainingRows": int(len(features)),
    }
    (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))

    return manifest
