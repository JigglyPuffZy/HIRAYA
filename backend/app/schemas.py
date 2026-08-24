from typing import Any

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    fullName: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict[str, Any]


class WeatherLocationQuery(BaseModel):
    latitude: float
    longitude: float


class WeatherResponse(BaseModel):
    location: str
    temperature: float
    feelsLike: float
    humidity: float
    uvIndex: float = 0
    windSpeed: float
    condition: str
    description: str
    updatedAt: str


class HeatRiskPredictionRequest(BaseModel):
    assessment: dict[str, Any]
    weather: dict[str, Any]
    profile: dict[str, Any] | None = None
    submittedAt: str


class HeatRiskPredictionResponse(BaseModel):
    prediction: float
    riskLevel: str
    model: str
    modelVersion: str
    timestamp: str
    recommendations: list[str] | None = None


class AssessmentHistoryItem(BaseModel):
    id: str
    assessedAt: str
    riskLevel: str
    prediction: float | None = None
    weatherSummary: str | None = None
    model: str | None = None
    modelVersion: str | None = None
