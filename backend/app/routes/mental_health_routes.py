from __future__ import annotations

from fastapi import APIRouter, Depends

from ..controllers.care.mental_health_controller import (
    create_intervention_plan,
    get_community_analytics,
    get_submission_history,
)
from ..dependencies import get_llm, get_mindsignal
from ..groq_client import GroqClient
from ..models import (
    MentalHealthAnalyticsRequest,
    MentalHealthAnalyticsResponse,
    MentalHealthHistoryRequest,
    MentalHealthHistoryResponse,
    MentalHealthRequest,
    MentalHealthResponse,
)
from ..services.mindsignal_service import MindSignalService


router = APIRouter(prefix='/api/mental-health', tags=['mental-health'])


@router.post('', response_model=MentalHealthResponse)
async def mental_health(
    payload: MentalHealthRequest,
    llm: GroqClient = Depends(get_llm),
    mindsignal: MindSignalService = Depends(get_mindsignal),
) -> MentalHealthResponse:
    return await create_intervention_plan(payload, llm, mindsignal)


@router.post('/analytics', response_model=MentalHealthAnalyticsResponse)
async def mental_health_analytics(
    payload: MentalHealthAnalyticsRequest,
    mindsignal: MindSignalService = Depends(get_mindsignal),
) -> MentalHealthAnalyticsResponse:
    return await get_community_analytics(payload, mindsignal)


@router.post('/history', response_model=MentalHealthHistoryResponse)
async def mental_health_history(
    payload: MentalHealthHistoryRequest,
    mindsignal: MindSignalService = Depends(get_mindsignal),
) -> MentalHealthHistoryResponse:
    return await get_submission_history(payload, mindsignal)
