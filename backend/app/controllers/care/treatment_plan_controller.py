from __future__ import annotations

from typing import Any, Dict

from ...groq_client import GroqClient
from ...models import TreatmentPlanRequest
from ...prompts import build_treatment_plan_prompt


async def build_treatment_plan(payload: TreatmentPlanRequest, llm: GroqClient) -> Dict[str, Any]:
    data = await llm.chat_json(
        system_prompt='You are a physician creating practical treatment plans. Return valid JSON only.',
        user_prompt=build_treatment_plan_prompt(payload),
        temperature=0.1,
        max_tokens=3000,
    )
    return {'data': data}
