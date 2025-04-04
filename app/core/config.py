from pydantic import BaseModel, PostgresDsn

from pydantic_settings import BaseSettings, SettingsConfigDict

from dotenv import load_dotenv
import os

# Завантажити змінні з .env
load_dotenv()


class RunConfig(BaseModel):
    host: str = "0.0.0`"
    port: int = 8000


class DatabaseConfig(BaseModel):
    url: PostgresDsn
    echo: bool = False
    echo_pool: bool = False
    max_overflow: int = 10
    pool_size: int = 5


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="APP_CONFIG__",
    )

    run: RunConfig = RunConfig()
    db: DatabaseConfig


settings = Settings()
