from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CleanSight AI"
    DATABASE_URL: str = "sqlite:///./cleansight.db"
    STORAGE_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
