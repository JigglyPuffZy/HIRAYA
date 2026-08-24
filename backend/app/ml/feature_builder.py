"""Feature engineering aligned with the heatstroke training dataset."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.ml.health_conditions import HEALTH_CONDITION_COLUMNS, encode_health_conditions

FEATURE_COLUMNS = [
    "age",
    "sleeping_hours",
    "has_breakfast",
    "env_temperature",
    "wind_speed",
    "humidity",
    "body_temperature",
    "heart_rate",
    "activity_level",
    "hydration",
    "feels_like",
    "uv_index",
    *HEALTH_CONDITION_COLUMNS,
]

ACTIVITY_MAP = {"A": 0, "B": 1, "C": 2, "light": 0, "moderate": 1, "heavy": 2}


def _yes_no(value: Any) -> float:
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    if isinstance(value, (int, float)):
        return 1.0 if value else 0.0
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"yes", "true", "1", "y", "well_hydrated", "well"}:
            return 1.0
        if normalized in {"no", "false", "0", "n", "dehydrated"}:
            return 0.0
    return 0.0


def _activity(value: Any) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        key = value.strip().upper()
        if key in ACTIVITY_MAP:
            return float(ACTIVITY_MAP[key])
        lowered = value.strip().lower()
        if lowered in ACTIVITY_MAP:
            return float(ACTIVITY_MAP[lowered])
    return 0.0


def _float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def build_feature_row(
    assessment: dict[str, Any],
    weather: dict[str, Any],
    profile: dict[str, Any] | None = None,
) -> dict[str, float]:
    merged = {**(profile or {}), **assessment}
    health_flags = encode_health_conditions(merged)

    row = {
        "age": _float(merged.get("age"), 30.0),
        "sleeping_hours": _float(merged.get("sleeping_hours"), 7.0),
        "has_breakfast": _yes_no(merged.get("has_breakfast")),
        "env_temperature": _float(weather.get("temperature"), 30.0),
        "wind_speed": _float(weather.get("windSpeed"), 5.0),
        "humidity": _float(weather.get("humidity"), 60.0),
        "body_temperature": _float(merged.get("body_temperature"), 37.0),
        "heart_rate": _float(merged.get("heart_rate"), 80.0),
        "activity_level": _activity(merged.get("activity_level", "A")),
        "hydration": _yes_no(merged.get("hydration") or merged.get("hydration_status")),
        "feels_like": _float(weather.get("feelsLike"), _float(weather.get("temperature"), 30.0)),
        "uv_index": _float(weather.get("uvIndex"), 0.0),
    }
    row.update(health_flags)
    return row


def features_to_array(feature_row: dict[str, float]) -> np.ndarray:
    return np.array([[feature_row[column] for column in FEATURE_COLUMNS]], dtype=float)


def _augment_with_health_vulnerability_rows(base: pd.DataFrame, target: pd.Series) -> tuple[pd.DataFrame, pd.Series]:
    """Append rule-augmented rows so the model learns health-condition effects."""
    from app.ml.health_conditions import CONDITION_WEIGHTS

    augmented_rows: list[dict[str, float]] = []
    augmented_labels: list[int] = []

    templates = base.sample(n=min(1500, len(base)), random_state=42).to_dict(orient="records")
    labels = target.sample(n=min(1500, len(base)), random_state=42).tolist()

    for template, label in zip(templates, labels):
        for condition, weight in CONDITION_WEIGHTS.items():
            row = dict(template)
            for col in HEALTH_CONDITION_COLUMNS:
                row[col] = 0.0
            row[condition] = 1.0
            augmented_rows.append(row)
            boosted = min(1, label + (1 if weight >= 20 else 0))
            augmented_labels.append(boosted)

        combo = dict(template)
        for col in HEALTH_CONDITION_COLUMNS:
            combo[col] = 0.0
        combo["asthma"] = 1.0
        combo["hypertension"] = 1.0
        augmented_rows.append(combo)
        augmented_labels.append(min(1, label + 1))

    if not augmented_rows:
        return base, target

    aug_features = pd.DataFrame(augmented_rows)
    aug_target = pd.Series(augmented_labels, name=target.name)
    combined = pd.concat([base, aug_features], ignore_index=True)
    combined_target = pd.concat([target, aug_target], ignore_index=True)
    return combined, combined_target


def load_training_frame(csv_path: str, augment_health: bool = True) -> tuple[pd.DataFrame, pd.Series]:
    df = pd.read_csv(csv_path)

    features = pd.DataFrame(
        {
            "age": df["age"],
            "sleeping_hours": df["sleeping_hours"],
            "has_breakfast": df["has_breakfast"].map(_yes_no),
            "env_temperature": df["12_temperature"],
            "wind_speed": df["12_wind_speed"],
            "humidity": df["12_humidity"],
            "body_temperature": df["12_body_temperature"],
            "heart_rate": df["12_heart_rate"],
            "activity_level": df["12_operation"].map(_activity),
            "hydration": df["12_hydration"].map(_yes_no),
            "feels_like": df["12_temperature"],
            "uv_index": 0.0,
        }
    )

    for column in HEALTH_CONDITION_COLUMNS:
        features[column] = 0.0

    target = df["heatstroke"].map(lambda value: 1 if str(value).strip().lower() == "yes" else 0)

    if augment_health:
        features, target = _augment_with_health_vulnerability_rows(features, target)

    return features, target
