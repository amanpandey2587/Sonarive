from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List

from dotenv import dotenv_values, load_dotenv


BACKEND_ENV_PATH = Path(__file__).resolve().parents[1] / '.env'
APP_ENV_PATH = Path(__file__).resolve().parent / '.env'
REPO_ENV_PATH = Path(__file__).resolve().parents[2] / '.env'
BACKEND_ROOT_PATH = Path(__file__).resolve().parents[1]


def _load_env_files() -> None:
    for candidate in (REPO_ENV_PATH, APP_ENV_PATH, BACKEND_ENV_PATH):
        if candidate.exists():
            load_dotenv(candidate, override=True)


def _clean_env_value(name: str, default: str = '') -> str:
    value = os.getenv(name, default).strip()
    duplicated_prefix = f'{name}='
    if value.startswith(duplicated_prefix):
        value = value[len(duplicated_prefix):].strip()
    return value


def resolve_groq_key_source() -> str:
    for candidate in (BACKEND_ENV_PATH, APP_ENV_PATH, REPO_ENV_PATH):
        if not candidate.exists():
            continue
        value = (dotenv_values(candidate).get('GROQ_API_KEY') or '').strip()
        if value:
            return str(candidate)
    return 'process environment only'


_load_env_files()


@dataclass(frozen=True)
class Settings:
    groq_api_key: str
    groq_base_url: str
    groq_text_model: str
    groq_vision_model: str
    backend_cors_origins: List[str]
    request_timeout_seconds: float
    overpass_base_url: str
    app_host: str
    app_port: int
    mindsignal_model_path: str
    mindsignal_predictions_path: str
    mindsignal_submissions_path: str
    spark_app_name: str
    spark_master: str
    spark_shuffle_partitions: int
    similar_cases_limit: int
    mental_health_history_limit: int
    mindsignal_context_timeout_seconds: float
    mindsignal_analytics_timeout_seconds: float

    @classmethod
    def from_env(cls) -> 'Settings':
        cors_origins = _clean_env_value(
            'BACKEND_CORS_ORIGINS',
            'http://localhost:3000,http://127.0.0.1:3000',
        )
        return cls(
            groq_api_key=_clean_env_value('GROQ_API_KEY'),
            groq_base_url=_clean_env_value('GROQ_BASE_URL', 'https://api.groq.com/openai/v1').rstrip('/'),
            groq_text_model=_clean_env_value('GROQ_TEXT_MODEL', 'openai/gpt-oss-20b'),
            groq_vision_model=_clean_env_value(
                'GROQ_VISION_MODEL',
                'meta-llama/llama-4-scout-17b-16e-instruct',
            ),
            backend_cors_origins=[item.strip() for item in cors_origins.split(',') if item.strip()],
            request_timeout_seconds=float(_clean_env_value('REQUEST_TIMEOUT_SECONDS', '60')),
            overpass_base_url=_clean_env_value(
                'OVERPASS_BASE_URL',
                'https://overpass-api.de/api/interpreter',
            ).rstrip('/'),
            app_host=_clean_env_value('HOST', '0.0.0.0'),
            app_port=int(_clean_env_value('PORT', '8000')),
            mindsignal_model_path=_clean_env_value(
                'MINDSIGNAL_MODEL_PATH',
                str((BACKEND_ROOT_PATH / 'mindsignal_model.pkl').resolve()),
            ),
            mindsignal_predictions_path=_clean_env_value(
                'MINDSIGNAL_PREDICTIONS_PATH',
                str((BACKEND_ROOT_PATH / 'mindsignal_db' / 'predictions').resolve()),
            ),
            mindsignal_submissions_path=_clean_env_value(
                'MINDSIGNAL_SUBMISSIONS_PATH',
                str((BACKEND_ROOT_PATH / 'mindsignal_db' / 'submissions').resolve()),
            ),
            spark_app_name=_clean_env_value('SPARK_APP_NAME', 'MindSignal'),
            spark_master=_clean_env_value('SPARK_MASTER', 'local[*]'),
            spark_shuffle_partitions=int(_clean_env_value('SPARK_SQL_SHUFFLE_PARTITIONS', '4')),
            similar_cases_limit=int(_clean_env_value('MINDSIGNAL_SIMILAR_CASES_LIMIT', '5')),
            mental_health_history_limit=int(_clean_env_value('MENTAL_HEALTH_HISTORY_LIMIT', '8')),
            mindsignal_context_timeout_seconds=float(_clean_env_value('MINDSIGNAL_CONTEXT_TIMEOUT_SECONDS', '25')),
            mindsignal_analytics_timeout_seconds=float(_clean_env_value('MINDSIGNAL_ANALYTICS_TIMEOUT_SECONDS', '60')),
        )

    @property
    def groq_is_configured(self) -> bool:
        return bool(self.groq_api_key)
