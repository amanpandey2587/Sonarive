from __future__ import annotations

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .groq_client import GroqApiError


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={'error': 'Invalid input data.', 'details': exc.errors()})


async def groq_exception_handler(_: Request, exc: GroqApiError) -> JSONResponse:
    return JSONResponse(status_code=502, content={'error': str(exc)})


async def http_exception_handler(_: Request, exc: httpx.HTTPError) -> JSONResponse:
    return JSONResponse(
        status_code=502,
        content={'error': 'External service request failed.', 'details': str(exc)},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(GroqApiError, groq_exception_handler)
    app.add_exception_handler(httpx.HTTPError, http_exception_handler)
