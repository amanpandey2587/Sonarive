# backend/app/controllers/discovery/hospital_controller.py

from __future__ import annotations

from ...models import HospitalRecommendationRequest, HospitalRecommendationResponse, HospitalRecommendation  # ← add HospitalRecommendation here
from ...osm import OsmHospitalService
from .hospital_graph import hospital_graph

async def recommend_hospitals(
    payload: HospitalRecommendationRequest,
    osm: OsmHospitalService,
) -> HospitalRecommendationResponse:

    if not payload.diagnosedConditions and not payload.symptoms:
        return HospitalRecommendationResponse(
            recommendationIntro='No conditions or symptoms provided.',
            hospitals=[],
            disclaimer='This is a directory-style result, not medical advice.',
        )

    if payload.userLatitude is None or payload.userLongitude is None:
        return HospitalRecommendationResponse(
            recommendationIntro='Share your location to find nearby hospitals.',
            hospitals=[],
            disclaimer='Location is required for ranking.',
        )

    # ── Run the LangGraph pipeline ────────────────────────────────────────
    initial_state = {
        "conditions":        payload.diagnosedConditions or [],
        "symptoms":          payload.symptoms or [],
        "lat":               payload.userLatitude,
        "lon":               payload.userLongitude,
        "radius_km":         payload.searchRadiusKm or 25,
        "prefer_government": payload.preferGovernmentHospitals or False,
        "specialty_keywords": [],
        "osm_query_tag":     "hospital",
        "osm_results":       [],
        "ranked_hospitals":  [],
        "recommendation_intro": "",
        "error":             None,
    }

    # result = await hospital_graph.ainvoke(initial_state, config={"osm": osm})
    result = await hospital_graph.ainvoke(
    initial_state,
    config={"configurable": {"osm": osm}}   # ← wrap in "configurable" key
    )
    # ─────────────────────────────────────────────────────────────────────
    return HospitalRecommendationResponse(
        recommendationIntro=result["recommendation_intro"],
        hospitals=[HospitalRecommendation(**h) for h in result["ranked_hospitals"]],
        disclaimer='Verify specialist availability directly with the hospital.',
    )