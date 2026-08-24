"""Load trained model artifacts and run inference."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.config import settings
from app.ml.feature_builder import FEATURE_COLUMNS, build_feature_row, features_to_array
from app.ml.risk_levels import recommendations_for_level, score_to_risk_level


class ModelNotReadyError(RuntimeError):
    pass


class HeatRiskPredictor:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_dir = model_dir or settings.model_directory
        self._artifact: dict[str, Any] | None = None
        self._manifest: dict[str, Any] | None = None

    def is_ready(self) -> bool:
        return (self.model_dir / "champion.joblib").exists()

    def _load(self) -> None:
        if self._artifact is not None:
            return

        model_path = self.model_dir / f"{settings.hiraya_active_model}.joblib"
        if not model_path.exists():
            raise ModelNotReadyError(
                f"No trained model found at {model_path}. Run scripts/train_model.py first."
            )

        self._artifact = joblib.load(model_path)
        manifest_path = self.model_dir / "manifest.json"
        if manifest_path.exists():
            self._manifest = json.loads(manifest_path.read_text())
        else:
            self._manifest = {
                "modelVersion": self._artifact.get("model_version", "unknown"),
                "champion": self._artifact.get("model_name", "unknown"),
            }

    def predict(
        self,
        assessment: dict[str, Any],
        weather: dict[str, Any],
        profile: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        self._load()
        assert self._artifact is not None
        assert self._manifest is not None

        feature_row = build_feature_row(assessment, weather, profile)
        feature_array = features_to_array(feature_row)

        model = self._artifact["model"]
        probability = float(model.predict_proba(feature_array)[0][1])
        risk_level = score_to_risk_level(probability)

        return {
            "prediction": round(probability, 4),
            "riskLevel": risk_level,
            "model": str(self._manifest.get("champion", self._artifact.get("model_name", "unknown"))),
            "modelVersion": str(
                self._manifest.get("modelVersion", self._artifact.get("model_version", "unknown"))
            ),
            "recommendations": recommendations_for_level(risk_level),
            "featureColumns": FEATURE_COLUMNS,
            "features": feature_row,
        }


predictor = HeatRiskPredictor()
