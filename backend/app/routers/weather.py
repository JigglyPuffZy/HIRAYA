from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.config import settings
from app.dependencies import AuthenticatedUser, get_current_user
from app.schemas import WeatherLocationQuery, WeatherResponse

router = APIRouter()


@router.post("/current", response_model=WeatherResponse)
async def get_current_weather(
    query: WeatherLocationQuery,
    _: AuthenticatedUser = Depends(get_current_user),
) -> WeatherResponse:
    if not settings.openweather_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Weather proxy is not configured. Set OPENWEATHER_API_KEY on the backend.",
        )

    params = {
        "lat": query.latitude,
        "lon": query.longitude,
        "appid": settings.openweather_api_key,
        "units": "metric",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params=params,
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to fetch weather data from OpenWeather.",
        ) from error

    weather = payload.get("weather", [{}])[0]
    main = payload.get("main", {})
    wind = payload.get("wind", {})

    return WeatherResponse(
        location=payload.get("name", "Unknown"),
        temperature=float(main.get("temp", 0)),
        feelsLike=float(main.get("feels_like", main.get("temp", 0))),
        humidity=float(main.get("humidity", 0)),
        uvIndex=0,
        windSpeed=float(wind.get("speed", 0)),
        condition=str(weather.get("main", "Unknown")),
        description=str(weather.get("description", "")),
        updatedAt=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    )
