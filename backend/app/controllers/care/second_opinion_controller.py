from __future__ import annotations

from typing import Any, Dict

from ...groq_client import GroqClient
from ...models import SecondOpinionRequest
from ...prompts import build_second_opinion_prompt


async def fetch_second_opinion(payload: SecondOpinionRequest, llm: GroqClient) -> Dict[str, Any]:
    data = await llm.chat_json(
        system_prompt='You are a senior medical specialist. Return valid JSON only.',
        user_prompt=build_second_opinion_prompt(payload),
        temperature=0.1,
        max_tokens=2600,
    )
    return {'data': data}
