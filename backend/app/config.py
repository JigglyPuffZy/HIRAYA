from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    hiraya_cors_origins: str = "*"
    openweather_api_key: str = ""
    hiraya_model_dir: str = "./models"
    hiraya_active_model: str = "champion"

    # Supabase
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    supabase_service_role_key: str = ""
    database_url: str = "sqlite:///./hiraya.db"

    @property
    def cors_origin_list(self) -> list[str]:
        if self.hiraya_cors_origins.strip() == "*":
            return ["*"]
        return [
            origin.strip()
            for origin in self.hiraya_cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def model_directory(self) -> Path:
        return Path(self.hiraya_model_dir)

    @property
    def uses_supabase(self) -> bool:
        return bool(self.supabase_jwt_secret and self.database_url.startswith("postgresql"))


settings = Settings()
