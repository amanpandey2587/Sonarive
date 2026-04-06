from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, Depends
from app.services.ml_service import symptom_service
from ..controllers.care.drug_info_controller import fetch_drug_info
from ..controllers.care.scan_controller import analyze_scan_data, generate_scan_report
from ..controllers.care.second_opinion_controller import fetch_second_opinion
from ..controllers.care.treatment_plan_controller import build_treatment_plan
from ..dependencies import get_llm
from ..groq_client import GroqClient
from ..models import (
    DrugInfoRequest,
    ScanAnalyzeRequest,
    ScanFullRequest,
    SecondOpinionRequest,
    TreatmentPlanRequest,
)


router = APIRouter(prefix='/api', tags=['care'])


@router.post('/drug-info')
async def drug_info(payload: DrugInfoRequest, llm: GroqClient = Depends(get_llm)) -> Dict[str, Any]:
    return await fetch_drug_info(payload, llm)


@router.post('/second-opinion')
async def second_opinion(payload: SecondOpinionRequest, llm: GroqClient = Depends(get_llm)) -> Dict[str, Any]:
    return await fetch_second_opinion(payload, llm)

@router.post("/treatment/symptom-check")
async def symptom_check(payload: dict):
    symptoms = payload.get("symptoms", "")
    result = symptom_service.predict(symptoms)
    return result


@router.post('/treatment-plan')
async def treatment_plan(payload: TreatmentPlanRequest, llm: GroqClient = Depends(get_llm)) -> Dict[str, Any]:
    return await build_treatment_plan(payload, llm)


@router.post('/scan-analyze')
async def scan_analyze(payload: ScanAnalyzeRequest, llm: GroqClient = Depends(get_llm)) -> Dict[str, Any]:
    scan_result = await analyze_scan_data(payload.scanDataUri, llm)
    return {'data': scan_result.model_dump()}


@router.post('/scan-full')
async def scan_full(payload: ScanFullRequest, llm: GroqClient = Depends(get_llm)) -> Dict[str, Any]:
    return await generate_scan_report(payload, llm)


@router.post("/treatment-plan-from-symptoms")
async def treatment_plan_from_symptoms(
    payload: TreatmentPlanRequest,
    llm: GroqClient = Depends(get_llm)
) -> Dict[str, Any]:
    """
    If symptoms are provided, run ML prediction first,
    then inject result into treatment plan prompt.
    """
    enriched = payload

    if payload.symptoms:
        ml_result = symptom_service.predict(payload.symptoms)
        enriched = TreatmentPlanRequest(
            disease=payload.disease,
            age=payload.age,
            gender=payload.gender,
            symptoms=payload.symptoms,
            mlPredictedDisease=ml_result["top_prediction"],
            mlConfidence=ml_result["confidence"],
        )

    return await build_treatment_plan(enriched, llm)