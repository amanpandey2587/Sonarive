from __future__ import annotations

import json
from typing import Sequence

from .models import (
    DrugInfoRequest,
    MentalHealthRequest,
    MentalHealthRiskPrediction,
    ScanAnalysisResponse,
    ScanFullRequest,
    SecondOpinionRequest,
    SimilarMentalHealthCase,
    TreatmentPlanRequest,
)


def build_mental_health_prompt(
    payload: MentalHealthRequest,
    risk_prediction: MentalHealthRiskPrediction | None = None,
    similar_cases: Sequence[SimilarMentalHealthCase] | None = None,
    population_context: str | None = None,
) -> str:
    location_info = 'User has not shared their location.'
    if payload.userLatitude is not None and payload.userLongitude is not None:
        location_info = (
            "User's approximate location for mental health support recommendations: "
            f'Latitude {payload.userLatitude:.4f}, Longitude {payload.userLongitude:.4f}.'
        )

    risk_block = 'No ML risk estimate was available.'
    if risk_prediction is not None:
        confidence_text = 'unknown confidence'
        if risk_prediction.confidence is not None:
            confidence_text = f'{risk_prediction.confidence * 100:.0f}% confidence'
        reasoning_text = risk_prediction.reasoning or 'No additional risk reasoning was supplied.'
        risk_block = (
            f'## Model-Derived Risk Estimate\n'
            f'- Predicted risk level: {risk_prediction.label}\n'
            f'- Confidence: {confidence_text}\n'
            f'- Source: {risk_prediction.source}\n'
            f'- Rationale: {reasoning_text}'
        )

    similar_cases_block = '## Similar Cases from the MindSignal Dataset\n- No similar cases were retrieved.'
    if similar_cases:
        rendered_cases = '\n'.join(
            f"- Case {index + 1} ({case.riskLevel} risk, overlap {case.overlapScore}): {case.excerpt}"
            for index, case in enumerate(similar_cases)
        )
        similar_cases_block = (
            '## Similar Cases from the MindSignal Dataset\n'
            f'{rendered_cases}\n'
            'Use these as context for how people with similar presentations have described their experiences.'
        )

    population_block = population_context or '## Population Context\n- Spark-derived population context was unavailable for this request.'

    return f"""
You are an expert clinical psychologist and digital mental health researcher.

Here is a user's screening data:
- PHQ-9 (Depression Score): {payload.ph9Score} / 27
- GAD-7 (Anxiety Score): {payload.gad7Score} / 21
- Age: {payload.age}
- Gender: {payload.gender}
- {location_info}

They wrote:
\"{payload.textInput}\"

{risk_block}

{population_block}

{similar_cases_block}

Provide a single markdown intervention plan with these sections:
## Immediate Safety Assessment
## Diagnostic Considerations
## Treatment Recommendations
## Monitoring Plan
## Supportive/Lifestyle Advice
## Nearby Psychiatrist/Clinic Recommendations

Requirements:
- Keep the tone calm, direct, and clinically responsible.
- Include crisis escalation advice when the content suggests self-harm or acute risk.
- Tie recommendations back to the predicted risk level and the Spark-derived context above.
- When location is present, suggest nearby care types and realistic local search guidance.
- Use markdown only.
""".strip()


def build_drug_info_prompt(payload: DrugInfoRequest) -> str:
    drugs = ', '.join(item.strip() for item in payload.drugs if item.strip())
    return f"""
You are a medical assistant. For the following medications: \"{drugs}\", return a JSON object only.

Schema:
{{
  "drugs": [
    {{
      "drugName": "ExampleDrug",
      "genericAlternatives": ["Generic1", "Generic2"],
      "sideEffects": ["Nausea", "Dizziness"],
      "allergies": ["Penicillin allergy"],
      "dosageByAgeGroup": {{
        "children": "5mg twice daily",
        "adults": "10mg once daily",
        "elderly": "5mg once daily"
      }},
      "standardPriceINR": "?50-?100 per strip",
      "usageInstructions": "Take after meals with water",
      "specialistRecommendation": "Consult a pulmonologist for long-term use",
      "imageUrl": "https://example.com/medicine-image.jpg"
    }}
  ]
}}

Requirements:
- Provide real medication names, not placeholders.
- Use concise, medically safe language.
- Include `imageUrl` only if reasonably confident it points to a medicine image.
- Output valid JSON only.
""".strip()


def build_second_opinion_prompt(payload: SecondOpinionRequest) -> str:
    return f"""
You are a senior medical specialist providing a careful second opinion.

Patient details:
- Condition: {payload.disease}
- Age: {payload.age}
- Gender: {payload.gender}
- Current medications: {payload.medicationWithDosages}

Return valid JSON only with this schema:
{{
  "condition": "{payload.disease}",
  "patient": {{
    "age": {payload.age},
    "gender": "{payload.gender}"
  }},
  "currentTreatment": "{payload.medicationWithDosages}",
  "assessment": "Whether the current treatment is appropriate and safe",
  "recommendations": {{
    "adjustments": ["dose or treatment changes"],
    "alternativeTreatments": ["alternatives"],
    "tests": ["additional investigations"]
  }},
  "justification": "Clinical reasoning",
  "warnings": ["risks, contraindications, or monitoring needs"]
}}

Requirements:
- Use specific medication names when relevant.
- Keep dosages realistic and age-appropriate.
- Output JSON only.
""".strip()


def build_treatment_plan_prompt(payload: TreatmentPlanRequest) -> str:
    
    # Build ML context block only if prediction exists
    ml_context = ""
    if payload.mlPredictedDisease and payload.mlConfidence:
        ml_context = f"""
ML Symptom Analysis (pre-diagnosis signal):
- Reported Symptoms : {payload.symptoms or 'not provided'}
- ML Predicted      : {payload.mlPredictedDisease} ({payload.mlConfidence}% confidence)
- Physician Disease : {payload.disease}
Note: Use ML prediction as supporting signal. Physician-confirmed disease takes priority.
"""

    return f"""
You are a highly experienced physician. Prepare a comprehensive, evidence-based diagnosis and treatment plan.

Patient:
- Condition: {payload.disease}
- Age: {payload.age}
- Gender: {payload.gender}
{ml_context}
Return valid JSON only:
{{
  "condition": "{payload.disease}",
  "patient": {{
    "age": {payload.age},
    "gender": "{payload.gender}"
  }},
  "summary": "Clinical summary",
  "diagnosticTests": ["specific recommended tests"],
  "treatmentPlan": {{
    "medications": ["specific medications"],
    "dosageGuidelines": {{
      "Medication Name": "dosage instructions"
    }},
    "duration": "expected treatment timeline"
  }},
  "lifestyle": ["actionable lifestyle changes"],
  "diet": ["diet advice"],
  "followUp": "monitoring and review schedule",
  "specialist": "specialist referral advice",
  "riskFactors": ["important risks"],
  "preventiveMeasures": ["long-term prevention steps"]
}}

Output JSON only.
""".strip()

def build_scan_analysis_prompt() -> str:
    return """
You are an expert radiologist reviewing a medical scan image.

Return valid JSON only in this exact shape:
{
  "findings": [
    {
      "condition": "potential finding",
      "anatomicalLocation": "location in the image/body",
      "severity": "mild/moderate/severe or equivalent",
      "confidence": 0.0
    }
  ],
  "summary": "plain-language summary"
}

Requirements:
- If the image looks normal or inconclusive, return an empty `findings` array and explain that in `summary`.
- Confidence must be a number between 0 and 1.
- Do not include markdown fences.
""".strip()


def build_scan_full_prompt(payload: ScanFullRequest, scan_analysis: ScanAnalysisResponse) -> str:
    compact_scan = {
        'summary': scan_analysis.summary,
        'findings': [
            {
                'condition': finding.condition,
                'anatomicalLocation': finding.anatomicalLocation,
                'severity': finding.severity,
                'confidence': finding.confidence,
            }
            for finding in scan_analysis.findings
        ],
    }
    serialized_scan = json.dumps(compact_scan, indent=2)
    age_value = 'null' if payload.age is None else str(payload.age)
    gender_value = payload.gender or 'unknown'
    return f"""
You are a senior medical expert. Combine the scan findings with the patient context to create an integrated medical report.

Patient context:
- Condition or symptoms: {payload.disease}
- Age: {age_value}
- Gender: {gender_value}

Scan analysis:
{serialized_scan}

Return valid JSON only:
{{
  "condition": "{payload.disease}",
  "patient": {{
    "age": {age_value},
    "gender": "{gender_value}"
  }},
  "summary": "Integrated executive summary",
  "radiology": {{
    "findings": [
      {{
        "condition": "specific finding",
        "location": "anatomical location",
        "severity": "severity level",
        "confidence": "confidence percentage"
      }}
    ],
    "summary": "Plain-language radiology overview"
  }},
  "diagnosisPlan": {{
    "clinicalSummary": "Integrated clinical assessment",
    "tests": ["recommended tests"],
    "treatment": {{
      "medications": ["recommended medications"],
      "dosages": {{
        "medication_name": "dosage instructions"
      }}
    }},
    "lifestyle": ["lifestyle recommendations"],
    "diet": ["diet recommendations"],
    "followUp": "follow-up plan",
    "specialists": "referral guidance",
    "risks": ["key risks"],
    "prevention": ["preventive measures"]
  }}
}}

Output JSON only.
""".strip()
