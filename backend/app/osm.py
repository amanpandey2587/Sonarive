from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import httpx

from .models import HospitalCoordinates, HospitalRecommendation, HospitalRecommendationRequest


SPECIALTY_KEYWORDS: Dict[str, Sequence[str]] = {
    "cardiology": ("heart", "cardiac", "cardio"),
    "pulmonology": ("lung", "pulmonary", "respiratory", "chest", "asthma"),
    "endocrinology": ("diabetes", "thyroid", "endocrine", "hormone"),
    "nephrology": ("kidney", "renal", "dialysis"),
    "neurology": ("brain", "neuro", "stroke", "seizure", "migraine"),
    "oncology": ("cancer", "tumor", "onco"),
    "orthopedics": ("bone", "joint", "fracture", "orthopedic", "spine"),
    "psychiatry": ("mental", "depression", "anxiety", "psychiatry", "psych"),
    "pediatrics": ("child", "children", "pediatric", "newborn"),
    "obstetrics and gynecology": ("pregnancy", "maternal", "women", "gynaec", "gynec", "obstetric"),
    "ophthalmology": ("eye", "vision", "ophthalm"),
    "dermatology": ("skin", "derma"),
    "ent": ("ear", "nose", "throat", "ent"),
    "gastroenterology": ("gastro", "digestive", "stomach", "liver", "abdomen"),
}


@dataclass
class RankedHospital:
    recommendation: HospitalRecommendation
    score: float
    distance_km: float


class OsmHospitalService:
    def __init__(self, client: httpx.AsyncClient, overpass_base_url: str) -> None:
        self.client = client
        self.overpass_base_url = overpass_base_url

    async def find_hospitals(
        self,
        payload: HospitalRecommendationRequest,
    ) -> List[HospitalRecommendation]:
        if payload.userLatitude is None or payload.userLongitude is None:
            return []

        radius_meters = int((payload.searchRadiusKm or 25) * 1000)
        query = f"""
[out:json][timeout:25];
(
  node["amenity"~"hospital|clinic"](around:{radius_meters},{payload.userLatitude},{payload.userLongitude});
  way["amenity"~"hospital|clinic"](around:{radius_meters},{payload.userLatitude},{payload.userLongitude});
  relation["amenity"~"hospital|clinic"](around:{radius_meters},{payload.userLatitude},{payload.userLongitude});
  node["healthcare"~"hospital|clinic|doctor"](around:{radius_meters},{payload.userLatitude},{payload.userLongitude});
  way["healthcare"~"hospital|clinic|doctor"](around:{radius_meters},{payload.userLatitude},{payload.userLongitude});
  relation["healthcare"~"hospital|clinic|doctor"](around:{radius_meters},{payload.userLatitude},{payload.userLongitude});
);
out center tags;
""".strip()

        response = await self.client.post(
            self.overpass_base_url,
            content=query,
            headers={"User-Agent": "Sonarive/1.0"},
        )
        response.raise_for_status()

        data = response.json()
        elements = data.get("elements", [])
        ranked = self._rank_elements(elements, payload)
        ranked.sort(key=lambda item: (-item.score, item.distance_km, item.recommendation.hospitalName.lower()))
        return [item.recommendation for item in ranked[:8]]

    def _rank_elements(
        self,
        elements: Iterable[dict],
        payload: HospitalRecommendationRequest,
    ) -> List[RankedHospital]:
        desired_specialties = self._infer_requested_specialties(payload)
        ranked: List[RankedHospital] = []

        for element in elements:
            tags = element.get("tags") or {}
            name = tags.get("name")
            if not name:
                continue

            lat, lng = self._extract_coordinates(element)
            if lat is None or lng is None:
                continue

            specialization = self._specialization_from_tags(tags)
            is_government = self._is_government(tags)
            distance = haversine_km(
                payload.userLatitude or 0.0,
                payload.userLongitude or 0.0,
                lat,
                lng,
            )
            score = 10.0 - min(distance, 25)

            matched_specialties: List[str] = []
            haystack = f"{name} {specialization}".lower()
            for specialty in desired_specialties:
                if specialty in matched_specialties:
                    continue
                keywords = SPECIALTY_KEYWORDS.get(specialty, ())
                if any(keyword in haystack for keyword in keywords):
                    score += 6
                    matched_specialties.append(specialty)

            if specialization != "General medicine and hospital services":
                score += 2.5

            if is_government:
                score += 1.5
                if payload.preferGovernmentHospitals:
                    score += 4

            amenity = (tags.get("amenity") or tags.get("healthcare") or "").lower()
            if "hospital" in amenity:
                score += 2

            ranking_reason_parts = []
            if matched_specialties:
                ranking_reason_parts.append(
                    "Matched likely specialty fit for "
                    + ", ".join(matched_specialties[:2])
                )
            ranking_reason_parts.append(f"Approximately {distance:.1f} km away")
            if is_government:
                ranking_reason_parts.append("public/government facility")
            if specialization:
                ranking_reason_parts.append(specialization)

            recommendation = HospitalRecommendation(
                hospitalName=name,
                specializationFocus=specialization,
                simulatedRankingReason=". ".join(ranking_reason_parts) + ".",
                address=self._format_address(tags),
                coordinates=HospitalCoordinates(lat=lat, lng=lng),
                contact=self._contact(tags),
            )
            ranked.append(
                RankedHospital(
                    recommendation=recommendation,
                    score=score,
                    distance_km=distance,
                )
            )

        deduped: Dict[Tuple[str, float, float], RankedHospital] = {}
        for item in ranked:
            coords = item.recommendation.coordinates
            if coords is None:
                continue
            key = (
                item.recommendation.hospitalName.strip().lower(),
                round(coords.lat, 4),
                round(coords.lng, 4),
            )
            if key not in deduped or item.score > deduped[key].score:
                deduped[key] = item
        return list(deduped.values())

    def _infer_requested_specialties(self, payload: HospitalRecommendationRequest) -> List[str]:
        text = " ".join((payload.diagnosedConditions or []) + (payload.symptoms or [])).lower()
        matches: List[str] = []
        for specialty, keywords in SPECIALTY_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                matches.append(specialty)
        return matches

    def _extract_coordinates(self, element: dict) -> Tuple[Optional[float], Optional[float]]:
        if "lat" in element and "lon" in element:
            return float(element["lat"]), float(element["lon"])
        center = element.get("center") or {}
        if "lat" in center and "lon" in center:
            return float(center["lat"]), float(center["lon"])
        return None, None

    def _specialization_from_tags(self, tags: dict) -> str:
        for key in (
            "healthcare:speciality",
            "healthcare:specialty",
            "medical_specialty",
            "speciality",
            "specialty",
            "description",
        ):
            value = tags.get(key)
            if value:
                return str(value).replace(";", ", ")
        return "General medicine and hospital services"

    def _format_address(self, tags: dict) -> Optional[str]:
        parts = [
            self._join_non_empty(tags.get("addr:housenumber"), tags.get("addr:street")),
            tags.get("addr:suburb"),
            tags.get("addr:city") or tags.get("addr:town") or tags.get("addr:village"),
            tags.get("addr:state"),
            tags.get("addr:postcode"),
        ]
        cleaned = [part for part in parts if part]
        return ", ".join(cleaned) if cleaned else None

    def _contact(self, tags: dict) -> Optional[str]:
        for key in ("contact:phone", "phone", "contact:website", "website"):
            value = tags.get(key)
            if value:
                return str(value)
        return None

    def _is_government(self, tags: dict) -> bool:
        joined = " ".join(
            str(tags.get(key, "")).lower()
            for key in ("operator", "operator:type", "ownership", "name")
        )
        return any(token in joined for token in ("government", "govt", "public", "municipal"))

    def _join_non_empty(self, left: Optional[str], right: Optional[str]) -> Optional[str]:
        values = [item for item in (left, right) if item]
        if not values:
            return None
        return " ".join(values)


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius * c
