import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import AssessmentRecord, get_db
from app.dependencies import AuthenticatedUser, get_current_user
from app.schemas import AssessmentHistoryItem

router = APIRouter()


@router.get("/history", response_model=list[AssessmentHistoryItem])
def get_history(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> list[AssessmentHistoryItem]:
    records = (
        db.query(AssessmentRecord)
        .filter(AssessmentRecord.user_id == current_user.user_id)
        .order_by(AssessmentRecord.assessed_at.desc())
        .all()
    )

    return [
        AssessmentHistoryItem(
            id=record.id,
            assessedAt=record.assessed_at.isoformat().replace("+00:00", "Z"),
            riskLevel=record.risk_level,
            prediction=record.prediction,
            weatherSummary=record.weather_summary,
            model=record.model,
            modelVersion=record.model_version,
        )
        for record in records
    ]


@router.get("/{assessment_id}")
def get_assessment_detail(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    record = (
        db.query(AssessmentRecord)
        .filter(
            AssessmentRecord.id == assessment_id,
            AssessmentRecord.user_id == current_user.user_id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found.",
        )

    try:
        return json.loads(record.payload_json)
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored assessment payload is corrupted.",
        ) from error
