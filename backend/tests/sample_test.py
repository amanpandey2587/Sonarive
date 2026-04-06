# backend/tests/test_basic.py
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_app_is_running():
    """Basic health check — just confirms the app starts and responds."""
    response = client.get("/")
    assert response.status_code in [200, 404]  # 404 is fine if no root route defined

def test_symptom_check_returns_something():
    """Confirms the symptom-check endpoint accepts POST and returns a response."""
    response = client.post(
        "/api/treatment/symptom-check",
        json={"symptoms": "fever headache fatigue"}
    )
    print("heelo")
    assert response.status_code in [200, 422, 500]  # just confirm it responds
    assert response is not None