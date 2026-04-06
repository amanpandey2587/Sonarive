from __future__ import annotations

import asyncio
from typing import Any, Callable, List, Tuple

from ...groq_client import GroqClient
from ...models import (
    MentalHealthAnalyticsRequest,
    MentalHealthAnalyticsResponse,
    MentalHealthHistoryRequest,
    MentalHealthHistoryResponse,
    MentalHealthRequest,
    MentalHealthResponse,
)
from ...prompts import build_mental_health_prompt
from ...services.mindsignal_service import MindSignalService


async def create_intervention_plan(
    payload: MentalHealthRequest,
    llm: GroqClient,
    mindsignal: MindSignalService,
) -> MentalHealthResponse:
    warnings: List[str] = []

    risk_prediction, risk_warnings = mindsignal.predict_risk(payload)
    warnings.extend(risk_warnings)

    (similar_cases, similar_warnings), (population_context, context_warnings) = await asyncio.gather(
        _run_with_timeout(
            lambda: mindsignal.find_similar_cases(payload.textInput, risk_prediction.label),
            timeout_seconds=mindsignal.settings.mindsignal_context_timeout_seconds,
            timeout_message='Similar-case retrieval timed out; continuing without Spark case context.',
            fallback=([], []),
        ),
        _run_with_timeout(
            lambda: mindsignal.build_population_context(risk_prediction.label, payload.ph9Score),
            timeout_seconds=mindsignal.settings.mindsignal_context_timeout_seconds,
            timeout_message='Population context query timed out; continuing without Spark population context.',
            fallback=(None, []),
        ),
    )
    warnings.extend(similar_warnings)
    warnings.extend(context_warnings)

    result = await llm.chat_text(
        system_prompt='You are a careful clinical psychology assistant. Reply in markdown only.',
        user_prompt=build_mental_health_prompt(
            payload,
            risk_prediction=risk_prediction,
            similar_cases=similar_cases,
            population_context=population_context,
        ),
        temperature=0.35,
        max_tokens=2600,
    )

    warnings.extend(mindsignal.log_submission(payload, risk_prediction))
    history, history_warnings = mindsignal.get_history(payload.clientId)
    warnings.extend(history_warnings)

    unique_warnings = list(dict.fromkeys(warning for warning in warnings if warning))
    return MentalHealthResponse(
        interventionPlan=result,
        riskPrediction=risk_prediction,
        similarCases=similar_cases,
        analytics=None,
        history=history,
        populationContext=population_context,
        warnings=unique_warnings,
    )


async def get_community_analytics(
    payload: MentalHealthAnalyticsRequest,
    mindsignal: MindSignalService,
) -> MentalHealthAnalyticsResponse:
    analytics, warnings = await _run_with_timeout(
        lambda: mindsignal.get_community_analytics(payload.riskLevel),
        timeout_seconds=mindsignal.settings.mindsignal_analytics_timeout_seconds,
        timeout_message='Community analytics query timed out; try again after the Spark cache warms up.',
        fallback=(None, []),
    )
    return MentalHealthAnalyticsResponse(
        riskLevel=payload.riskLevel,
        analytics=analytics,
        warnings=list(dict.fromkeys(warning for warning in warnings if warning)),
    )


async def get_submission_history(
    payload: MentalHealthHistoryRequest,
    mindsignal: MindSignalService,
) -> MentalHealthHistoryResponse:
    history, warnings = mindsignal.get_history(payload.clientId, payload.limit)
    return MentalHealthHistoryResponse(
        clientId=payload.clientId,
        history=history,
        warnings=list(dict.fromkeys(warning for warning in warnings if warning)),
    )


async def _run_with_timeout(
    callback: Callable[[], Tuple[Any, List[str]]],
    *,
    timeout_seconds: float,
    timeout_message: str,
    fallback: Tuple[Any, List[str]],
) -> Tuple[Any, List[str]]:
    try:
        return await asyncio.wait_for(asyncio.to_thread(callback), timeout=timeout_seconds)
    except asyncio.TimeoutError:
        fallback_value, fallback_warnings = fallback
        return fallback_value, list(dict.fromkeys([timeout_message, *fallback_warnings]))
