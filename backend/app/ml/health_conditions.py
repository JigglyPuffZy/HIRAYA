"""Health condition feature encoding shared by training and inference."""

from __future__ import annotations

from typing import Any

HEALTH_CONDITION_COLUMNS = [
    "asthma",
    "hypertension",
    "heart_disease",
    "diabetes",
    "kidney_disease",
    "copd",
    "obesity",
    "other_chronic",
]

CONDITION_WEIGHTS = {
    "asthma": 18,
    "hypertension": 16,
    "heart_disease": 26,
    "diabetes": 15,
    "kidney_disease": 24,
    "copd": 22,
    "obesity": 12,
    "other_chronic": 10,
}


def _parse_conditions(raw: Any) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(item).strip().lower() for item in raw if str(item).strip()]
    if isinstance(raw, str):
        value = raw.strip().lower()
        if not value or value == "none":
            return []
        if value.startswith("["):
            import json

            try:
                parsed = json.loads(value)
                return _parse_conditions(parsed)
            except json.JSONDecodeError:
                pass
        if "," in value:
            return [part.strip().lower() for part in value.split(",") if part.strip()]
        if value == "respiratory":
            return ["copd"]
        return [value]
    return []


def encode_health_conditions(merged: dict[str, Any]) -> dict[str, float]:
    conditions = _parse_conditions(merged.get("health_conditions"))
    if not conditions:
        conditions = _parse_conditions(merged.get("health_condition"))

    encoded = {column: 0.0 for column in HEALTH_CONDITION_COLUMNS}
    for condition in conditions:
        if condition in encoded:
            encoded[condition] = 1.0
    return encoded
