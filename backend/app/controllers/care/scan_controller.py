from __future__ import annotations

from typing import Any, Dict

from ...groq_client import GroqClient
from ...models import IntegratedMedicalReport, ScanAnalysisResponse, ScanFinding, ScanFullRequest
from ...prompts import build_scan_analysis_prompt, build_scan_full_prompt


async def analyze_scan_data(scan_data_uri: str, llm: GroqClient) -> ScanAnalysisResponse:
    data = await llm.vision_json(
        system_prompt='You are a radiology assistant. Return cautious JSON only.',
        user_prompt=build_scan_analysis_prompt(),
        image_data_uri=scan_data_uri,
        temperature=0.1,
        max_tokens=2200,
    )

    findings_payload = data.get('findings') or []
    normalized_findings = []
    for item in findings_payload:
        if not isinstance(item, dict):
            continue
        normalized_findings.append(
            ScanFinding(
                condition=str(item.get('condition', 'Unspecified finding')),
                anatomicalLocation=str(item.get('anatomicalLocation') or item.get('location') or 'Unspecified location'),
                severity=str(item.get('severity', 'Unspecified')),
                confidence=_coerce_confidence(item.get('confidence')),
                highlightedArea=scan_data_uri,
            )
        )

    summary = str(data.get('summary') or 'No summary was returned.')
    return ScanAnalysisResponse(findings=normalized_findings, summary=summary)


async def generate_scan_report(payload: ScanFullRequest, llm: GroqClient) -> Dict[str, Any]:
    scan_analysis = payload.scanAnalysis or await analyze_scan_data(payload.scanDataUri, llm)
    data = await llm.chat_json(
        system_prompt='You are a medical expert creating integrated medical reports. Return valid JSON only.',
        user_prompt=build_scan_full_prompt(payload, scan_analysis),
        temperature=0.1,
        max_tokens=3200,
    )
    validated = IntegratedMedicalReport.model_validate(data)
    merged = validated.model_copy(
        update={
            'radiology': validated.radiology.model_copy(
                update={
                    'originalScanFindings': [item.model_dump() for item in scan_analysis.findings],
                    'originalScanSummary': scan_analysis.summary,
                }
            )
        }
    )
    return {'data': merged.model_dump(), 'scanAnalysis': scan_analysis.model_dump()}


def _coerce_confidence(raw: Any) -> float:
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, min(1.0, value))
