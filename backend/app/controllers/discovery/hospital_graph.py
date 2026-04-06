# backend/controllers/discovery/hospital_graph.py

from __future__ import annotations
import os
import json
import logging
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from langchain_core.runnables import RunnableConfig 
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

logger = logging.getLogger("sonarive.backend")

# ── LLM init ─────────────────────────────────────────────────────────────────

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com",
)

# ── 1. State ─────────────────────────────────────────────────────────────────

class HospitalState(TypedDict):
    conditions: list[str]
    symptoms: list[str]
    lat: float
    lon: float
    radius_km: int
    prefer_government: bool
    specialty_keywords: list[str]
    osm_query_tag: str
    osm_results: list[dict]
    ranked_hospitals: list[dict]
    recommendation_intro: str
    error: Optional[str]

# ── 2. Nodes ──────────────────────────────────────────────────────────────────

def parse_node(state: HospitalState) -> HospitalState:
    """LLM extracts OSM-friendly specialty tags from conditions/symptoms."""
    focus = state["conditions"] or state["symptoms"]

    prompt = f"""
    Given these medical conditions/symptoms: {focus}
    Return a JSON object with:
    - "specialty_keywords": 2-3 plain English specialties (e.g. ["cardiology", "cardiac surgery"])
    - "osm_tag": single best OSM amenity tag for Overpass query 
      (one of: hospital, clinic, doctors, pharmacy)
    
    Return ONLY raw JSON, no markdown, no backticks, no explanation.
    """

    print("\n" + "="*60)
    print("[parse_node] INPUT TO LLM:")
    print(prompt)
    print("="*60)

    resp = llm.invoke([HumanMessage(content=prompt)])

    raw = resp.content.strip()

    print("[parse_node] RAW OUTPUT FROM LLM:")
    print(repr(raw))
    print("="*60 + "\n")

    # strip markdown fences if model wrapped in ```json ... ```
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    print("[parse_node] CLEANED OUTPUT (after stripping fences):")
    print(raw)
    print("="*60 + "\n")

    try:
        parsed = json.loads(raw)
        print("[parse_node] PARSED SUCCESSFULLY:", parsed)
        return {
            **state,
            "specialty_keywords": parsed.get("specialty_keywords", []),
            "osm_query_tag":      parsed.get("osm_tag", "hospital"),
        }
    except Exception as e:
        print(f"[parse_node] JSON PARSE FAILED: {e}")
        print(f"[parse_node] Falling back to defaults")
        logger.warning("parse_node failed: %s | raw was: %r", e, raw)
        return {**state, "specialty_keywords": [], "osm_query_tag": "hospital"}


async def osm_node(state: HospitalState, config: RunnableConfig) -> HospitalState:
    """Hits Overpass API using the existing OsmHospitalService."""
    
    osm = config.get("configurable", {}).get("osm", None)

    # Studio / dev mode — no FastAPI context, return empty gracefully
    if osm is None:
        print("[osm_node] No OSM service injected — running in Studio/dev mode")
        return {**state, "osm_results": [], "error": "Studio mode - no OSM service"}

    try:
        from app.models import HospitalRecommendationRequest  # ← absolute import

        payload = HospitalRecommendationRequest(
            diagnosedConditions=state["conditions"],
            symptoms=state["symptoms"],
            userLatitude=state["lat"],
            userLongitude=state["lon"],
            searchRadiusKm=state["radius_km"],
            preferGovernmentHospitals=state["prefer_government"],
        )

        print("\n" + "="*60)
        print("[osm_node] CALLING find_hospitals WITH PAYLOAD:")
        print(f"  conditions={state['conditions']}")
        print(f"  symptoms={state['symptoms']}")
        print(f"  lat={state['lat']}, lon={state['lon']}")
        print(f"  radius_km={state['radius_km']}")
        print(f"  prefer_government={state['prefer_government']}")
        print("="*60)

        results = await osm.find_hospitals(payload)
        print(f"[osm_node] OSM RETURNED {len(results)} results")
        for r in results[:2]:
            print(f"  → {r.hospitalName}")
        print("="*60 + "\n")

        return {**state, "osm_results": [r.model_dump() for r in results]}

    except Exception as e:
        print(f"[osm_node] OSM CALL FAILED: {e}")
        return {**state, "osm_results": [], "error": str(e)}
def rank_node(state: HospitalState) -> HospitalState:
    """LLM ranks hospitals by specialty fit, not just distance."""
    if not state["osm_results"]:
        print("[rank_node] No OSM results to rank, skipping.")
        return {**state, "ranked_hospitals": []}

    hospitals_summary = [
        {"name": h.get("hospitalName"), "focus": h.get("specializationFocus")}
        for h in state["osm_results"][:15]   # ← hospitalName not name
    ]
    prompt = f"""
    Patient needs: {state["specialty_keywords"]}
    Prefer government hospitals: {state["prefer_government"]}
    
    Rank these hospitals by suitability (return top 5 indices as JSON array):
    {json.dumps(hospitals_summary, indent=2)}
    
    Return ONLY a JSON array of indices like [2, 0, 4, 1, 3].
    No markdown, no backticks, no explanation.
    """

    print("\n" + "="*60)
    print("[rank_node] INPUT TO LLM:")
    print(prompt)
    print("="*60)

    resp = llm.invoke([HumanMessage(content=prompt)])

    raw = resp.content.strip()

    print("[rank_node] RAW OUTPUT FROM LLM:")
    print(repr(raw))
    print("="*60 + "\n")

    # strip markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        indices = json.loads(raw)
        print(f"[rank_node] PARSED INDICES: {indices}")
        ranked = [state["osm_results"][i] for i in indices if i < len(state["osm_results"])]
        print(f"[rank_node] RANKED {len(ranked)} hospitals")
        return {**state, "ranked_hospitals": ranked}
    except Exception as e:
        print(f"[rank_node] JSON PARSE FAILED: {e}, falling back to top 5")
        return {**state, "ranked_hospitals": state["osm_results"][:5]}


def response_node(state: HospitalState) -> HospitalState:
    """Generates a natural intro string."""
    print("\n" + "="*60)
    print("[response_node] BUILDING FINAL RESPONSE")
    print(f"  error={state.get('error')}")
    print(f"  ranked_hospitals count={len(state['ranked_hospitals'])}")

    if state.get("error"):
        intro = "OpenStreetMap lookup failed. Please try again shortly."
    elif not state["ranked_hospitals"]:
        intro = f"No hospitals found within {state['radius_km']} km. Try widening the radius."
    else:
        focus = ", ".join(state["specialty_keywords"] or state["conditions"] or state["symptoms"])
        intro = f"Found {len(state['ranked_hospitals'])} hospitals best matched for {focus}, ranked by specialty fit."

    print(f"[response_node] INTRO: {intro}")
    print("="*60 + "\n")

    return {**state, "recommendation_intro": intro}

# ── 3. Routing ────────────────────────────────────────────────────────────────

def should_continue(state: HospitalState) -> str:
    if not state["osm_results"]:
        print("[router] No OSM results → going to respond directly")
        return "respond"
    print("[router] OSM results found → going to rank")
    return "rank"

# ── 4. Graph assembly ─────────────────────────────────────────────────────────

def build_hospital_graph():
    graph = StateGraph(HospitalState)

    graph.add_node("parse",   parse_node)
    graph.add_node("osm",     osm_node)
    graph.add_node("rank",    rank_node)
    graph.add_node("respond", response_node)

    graph.set_entry_point("parse")
    graph.add_edge("parse", "osm")
    graph.add_conditional_edges("osm", should_continue, {
        "rank":    "rank",
        "respond": "respond",
    })
    graph.add_edge("rank", "respond")
    graph.add_edge("respond", END)

    return graph.compile()

hospital_graph = build_hospital_graph()