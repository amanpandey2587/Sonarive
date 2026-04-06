from __future__ import annotations

from typing import Any, Dict

from ...groq_client import GroqClient
from ...models import DrugInfoPayload, DrugInfoRequest
from ...prompts import build_drug_info_prompt


async def fetch_drug_info(payload: DrugInfoRequest, llm: GroqClient) -> Dict[str, Any]:
    data = await llm.chat_json(
        system_prompt='You are a medical information assistant. Return valid JSON only.',
        user_prompt=build_drug_info_prompt(payload),
        temperature=0.1,
        max_tokens=2600,
    )
    validated = DrugInfoPayload.model_validate(data)
    return {'data': validated.model_dump()}
