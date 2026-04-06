from __future__ import annotations

from typing import Dict


async def health_check() -> Dict[str, str]:
    return {'status': 'ok'}
