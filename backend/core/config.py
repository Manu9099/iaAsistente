from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = ""
    APP_NAME: str = "Jarvis AI"
    VERSION: str = "1.0.0"

settings = Settings()