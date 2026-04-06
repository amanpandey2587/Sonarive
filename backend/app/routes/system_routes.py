from __future__ import annotations

from typing import Dict

from fastapi import APIRouter

from ..controllers.system.health_controller import health_check


router = APIRouter(tags=['system'])


@router.get('/health')
async def health() -> Dict[str, str]:
    return await health_check()
