from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Munich Event Platform"

    DATABASE_URL: str = "sqlite:///./local.db"
    
    class Config:
        env_file = ".env"  

settings = Settings() 