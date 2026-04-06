from __future__ import annotations

from fastapi import Request

from .groq_client import GroqClient
from .osm import OsmHospitalService
from .services.mindsignal_service import MindSignalService


def get_llm(request: Request) -> GroqClient:
    return request.app.state.llm


def get_osm(request: Request) -> OsmHospitalService:
    return request.app.state.osm


def get_mindsignal(request: Request) -> MindSignalService:
    return request.app.state.mindsignal
