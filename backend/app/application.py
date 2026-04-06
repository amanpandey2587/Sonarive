from __future__ import annotations

import logging
import os
import sys
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings
from .exception_handlers import register_exception_handlers
from .groq_client import GroqClient
from .osm import OsmHospitalService
from .routes.care_routes import router as care_router
from .routes.discovery_routes import router as discovery_router
from .routes.mental_health_routes import router as mental_health_router
from .routes.system_routes import router as system_router
from .services.mindsignal_service import MindSignalService


logger = logging.getLogger('sonarive.backend')
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Hadoop / Spark on Windows fix ──────────────────────────────────────
    sys.setrecursionlimit(10000)
    os.environ["HADOOP_HOME"] = r"D:\hadoop"
    os.environ["PATH"] = r"D:\hadoop\bin;" + os.environ.get("PATH", "")
    # ───────────────────────────────────────────────────────────────────────

    settings = Settings.from_env()
    app.state.settings = settings
    app.state.http_client = httpx.AsyncClient(timeout=settings.request_timeout_seconds)
    app.state.llm = GroqClient(settings, app.state.http_client)
    app.state.osm = OsmHospitalService(app.state.http_client, settings.overpass_base_url)
    app.state.mindsignal = MindSignalService(settings)
    logger.info('Sonarive Python backend started on port %s', settings.app_port)
    try:
        yield
    finally:
        await app.state.http_client.aclose()


def create_app() -> FastAPI:
    settings = Settings.from_env()
    app = FastAPI(title='Sonarive Backend', version='0.3.0', lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )
    register_exception_handlers(app)
    app.include_router(system_router)
    app.include_router(mental_health_router)
    app.include_router(care_router)
    app.include_router(discovery_router)
    return app