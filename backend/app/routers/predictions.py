import json
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import AssessmentRecord, get_db
from app.dependencies import AuthenticatedUser, get_current_user, utc_now_iso
from app.schemas import HeatRiskPredictionRequest, HeatRiskPredictionResponse
from app.ml.predictor import ModelNotReadyError, predictor

router = APIRouter()


def _weather_summary(weather: dict) -> str:
    location = weather.get("location", "Unknown")
    temperature = weather.get("temperature", 0)
    condition = weather.get("condition", "Unknown")
    return f"{location} · {round(float(temperature))}°C · {condition}"


@router.post("/heat-risk", response_model=HeatRiskPredictionResponse)
def predict_heat_risk(
    payload: HeatRiskPredictionRequest,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> HeatRiskPredictionResponse:
    try:
        result = predictor.predict(payload.assessment, payload.weather, payload.profile)
    except ModelNotReadyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    timestamp = utc_now_iso()
    response = HeatRiskPredictionResponse(
        prediction=result["prediction"],
        riskLevel=result["riskLevel"],
        model=result["model"],
        modelVersion=result["modelVersion"],
        timestamp=timestamp,
        recommendations=result.get("recommendations"),
    )

    detail_payload = {
        "prediction": response.model_dump(),
        "weather": payload.weather,
        "assessment": payload.assessment,
        "submittedAt": payload.submittedAt,
    }

    record = AssessmentRecord(
        id=str(uuid4()),
        user_id=current_user.user_id,
        assessed_at=datetime_from_iso(payload.submittedAt),
        risk_level=response.riskLevel,
        prediction=response.prediction,
        model=response.model,
        model_version=response.modelVersion,
        weather_summary=_weather_summary(payload.weather),
        payload_json=json.dumps(detail_payload),
    )
    try:
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()
        # Prediction still returned; mobile persists history separately.

    return response


def datetime_from_iso(value: str):
    from datetime import datetime

    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return datetime.utcnow()
