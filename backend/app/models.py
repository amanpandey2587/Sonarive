from __future__ import annotations

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


Gender = Literal['male', 'female', 'other']
MentalHealthGender = Literal['male', 'female', 'other', 'prefer_not_to_say']
RiskLabel = Literal['Low', 'Medium', 'High', 'Unknown']


class MentalHealthRequest(BaseModel):
    age: int = Field(..., ge=0, le=130)
    gender: MentalHealthGender
    ph9Score: int = Field(..., ge=0, le=27)
    gad7Score: int = Field(..., ge=0, le=21)
    textInput: str = Field(..., min_length=1)
    userLatitude: Optional[float] = None
    userLongitude: Optional[float] = None
    clientId: Optional[str] = Field(default=None, min_length=1)


class MentalHealthRiskPrediction(BaseModel):
    label: RiskLabel
    confidence: Optional[float] = Field(default=None, ge=0, le=1)
    source: str
    reasoning: Optional[str] = None


class SimilarMentalHealthCase(BaseModel):
    excerpt: str
    riskLevel: str
    overlapScore: int = Field(..., ge=0)
    subreddit: Optional[str] = None
    wordCount: Optional[int] = None


class MentalHealthRiskDistributionItem(BaseModel):
    predicted_risk: str
    count: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0)


class MentalHealthWordPattern(BaseModel):
    predicted_risk: str
    avg_words: float = Field(..., ge=0)
    avg_chars: float = Field(..., ge=0)


class MentalHealthCommunityBreakdownItem(BaseModel):
    subreddit_label: str
    post_count: int = Field(..., ge=0)


class MentalHealthAnalytics(BaseModel):
    distribution: List[MentalHealthRiskDistributionItem] = Field(default_factory=list)
    wordPatterns: List[MentalHealthWordPattern] = Field(default_factory=list)
    communityBreakdown: List[MentalHealthCommunityBreakdownItem] = Field(default_factory=list)
    totalDatasetSize: int = Field(default=0, ge=0)


class MentalHealthHistoryPoint(BaseModel):
    timestamp: str
    predictedRisk: str
    phq9Score: int = Field(..., ge=0, le=27)
    gad7Score: int = Field(..., ge=0, le=21)
    wordCount: int = Field(..., ge=0)


class MentalHealthResponse(BaseModel):
    interventionPlan: str
    riskPrediction: MentalHealthRiskPrediction
    similarCases: List[SimilarMentalHealthCase] = Field(default_factory=list)
    analytics: Optional[MentalHealthAnalytics] = None
    history: List[MentalHealthHistoryPoint] = Field(default_factory=list)
    populationContext: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)


class MentalHealthAnalyticsRequest(BaseModel):
    riskLevel: str = Field(..., min_length=1)


class MentalHealthAnalyticsResponse(BaseModel):
    riskLevel: str
    analytics: Optional[MentalHealthAnalytics] = None
    warnings: List[str] = Field(default_factory=list)


class MentalHealthHistoryRequest(BaseModel):
    clientId: str = Field(..., min_length=1)
    limit: int = Field(default=8, ge=1, le=50)


class MentalHealthHistoryResponse(BaseModel):
    clientId: str
    history: List[MentalHealthHistoryPoint] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class DrugInfoRequest(BaseModel):
    drugs: List[str] = Field(..., min_length=1)


class DosageByAgeGroup(BaseModel):
    children: str
    adults: str
    elderly: str


class DrugInfoItem(BaseModel):
    drugName: str
    genericAlternatives: List[str] = Field(default_factory=list)
    sideEffects: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    dosageByAgeGroup: DosageByAgeGroup
    standardPriceINR: str
    usageInstructions: str
    specialistRecommendation: str
    imageUrl: Optional[str] = None


class DrugInfoPayload(BaseModel):
    drugs: List[DrugInfoItem]


class SecondOpinionRequest(BaseModel):
    disease: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=150)
    gender: Gender
    medicationWithDosages: str = Field(..., min_length=1)


class TreatmentPlanRequest(BaseModel):
    disease: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=150)
    gender: Gender
    symptoms: Optional[str] = None          # raw symptom text from frontend
    mlPredictedDisease: Optional[str] = None  # what ML model predicted
    mlConfidence: Optional[float] = None 

class HospitalRecommendationRequest(BaseModel):
    diagnosedConditions: Optional[List[str]] = None
    symptoms: Optional[List[str]] = None
    userLatitude: Optional[float] = None
    userLongitude: Optional[float] = None
    searchRadiusKm: Optional[float] = Field(default=25, ge=1, le=500)
    preferGovernmentHospitals: Optional[bool] = False


class HospitalCoordinates(BaseModel):
    lat: float
    lng: float


class HospitalRecommendation(BaseModel):
    hospitalName: str
    specializationFocus: str
    simulatedRankingReason: str
    address: Optional[str] = None
    coordinates: Optional[HospitalCoordinates] = None
    contact: Optional[str] = None


class HospitalRecommendationResponse(BaseModel):
    recommendationIntro: str
    hospitals: List[HospitalRecommendation]
    disclaimer: Optional[str] = None


class ScanFinding(BaseModel):
    condition: str
    anatomicalLocation: str
    severity: str
    confidence: float = Field(..., ge=0, le=1)
    highlightedArea: str


class ScanAnalysisResponse(BaseModel):
    findings: List[ScanFinding]
    summary: str


class ScanAnalyzeRequest(BaseModel):
    scanDataUri: str = Field(..., pattern=r'^data:image/')


class ScanFullRequest(BaseModel):
    disease: str = Field(..., min_length=1)
    scanDataUri: str = Field(..., pattern=r'^data:image/')
    age: Optional[int] = Field(default=None, ge=0, le=150)
    gender: Optional[str] = None
    scanAnalysis: Optional[ScanAnalysisResponse] = None


class RadiologyFinding(BaseModel):
    condition: str
    location: str
    severity: str
    confidence: str


class RadiologySection(BaseModel):
    findings: List[RadiologyFinding]
    summary: str
    originalScanFindings: Optional[List[dict]] = None
    originalScanSummary: Optional[str] = None


class TreatmentSection(BaseModel):
    medications: List[str] = Field(default_factory=list)
    dosages: Dict[str, str] = Field(default_factory=dict)


class DiagnosisPlan(BaseModel):
    clinicalSummary: str
    tests: List[str] = Field(default_factory=list)
    treatment: TreatmentSection
    lifestyle: List[str] = Field(default_factory=list)
    diet: List[str] = Field(default_factory=list)
    followUp: str
    specialists: str
    risks: List[str] = Field(default_factory=list)
    prevention: List[str] = Field(default_factory=list)


class PatientInfo(BaseModel):
    age: Optional[int] = None
    gender: str


class IntegratedMedicalReport(BaseModel):
    condition: str
    patient: PatientInfo
    summary: str
    radiology: RadiologySection
    diagnosisPlan: DiagnosisPlan
