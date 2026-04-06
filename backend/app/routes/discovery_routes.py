from __future__ import annotations

from fastapi import APIRouter, Depends

from ..controllers.discovery.hospital_controller import recommend_hospitals
from ..dependencies import get_osm
from ..models import HospitalRecommendationRequest, HospitalRecommendationResponse
from ..osm import OsmHospitalService


router = APIRouter(prefix='/api', tags=['discovery'])


@router.post('/recommendHospital', response_model=HospitalRecommendationResponse)
async def recommend_hospital(
    payload: HospitalRecommendationRequest,
    osm: OsmHospitalService = Depends(get_osm),
) -> HospitalRecommendationResponse:
    return await recommend_hospitals(payload, osm)
