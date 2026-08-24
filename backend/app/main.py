from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.ml.predictor import predictor
from app.routers import assessments, auth, predictions, weather

app = FastAPI(
    title="HIRAYA Backend",
    description="Heat stroke risk prediction API with Random Forest, XGBoost, and LightGBM.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
app.include_router(weather.router, prefix="/weather", tags=["weather"])


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "modelReady": predictor.is_ready(),
        "supabaseConfigured": settings.uses_supabase,
    }
