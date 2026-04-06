# Sonarive Python Backend

FastAPI service for the Next.js frontend. It keeps the existing `/api/...` contracts and uses:

- Groq for AI generation
- OpenStreetMap Overpass for hospital lookup
- Leaflet on the frontend for mapping

## Structure

```text
backend/
  app/
    application.py          # app factory, lifecycle, middleware, router registration
    config.py               # dotenv loading and settings
    dependencies.py         # FastAPI dependency accessors for shared services
    exception_handlers.py   # shared API exception handlers
    groq_client.py          # Groq HTTP client wrapper
    models.py               # request and response schemas
    osm.py                  # OSM / Overpass hospital lookup logic
    parsing.py              # JSON cleanup helpers for model output
    prompts.py              # prompt builders
    routes/
      system_routes.py      # /health
      care_routes.py        # mental health, drugs, second opinion, treatment, scans
      discovery_routes.py   # hospital recommendation routes
    controllers/
      system/
        health_controller.py
      care/
        mental_health_controller.py
        drug_info_controller.py
        second_opinion_controller.py
        treatment_plan_controller.py
        scan_controller.py
      discovery/
        hospital_controller.py
    main.py                 # exports the assembled FastAPI app
  main.py                   # uvicorn entrypoint shim
  test_groq_key.py          # standalone Groq auth test
```

## Run

PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

WSL / bash:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Test Groq Key

Run this before starting the API if you want to validate auth separately:

```powershell
cd backend
.\venv\Scripts\python.exe test_groq_key.py
```

Expected result:

- `PASS: Groq accepted the API key.` means the key is valid and the backend config is reading it.
- `FAIL: ... 401 ...` means the key value or account auth is wrong.
- `FAIL: Network error ...` means the machine could not reach Groq.

## Environment

- `GROQ_API_KEY`
- `GROQ_TEXT_MODEL` default: `openai/gpt-oss-20b`
- `GROQ_VISION_MODEL` default: `meta-llama/llama-4-scout-17b-16e-instruct`
- `OVERPASS_BASE_URL`

## Endpoints

- `POST /api/mental-health`
- `POST /api/drug-info`
- `POST /api/second-opinion`
- `POST /api/recommendHospital`
- `POST /api/scan-analyze`
- `POST /api/scan-full`
- `POST /api/treatment-plan`
- `GET /health`

## Notes

- `scan-analyze` returns `highlightedArea` as the original image URI for now so the existing frontend contract stays intact.
- `scan-full` accepts an optional `scanAnalysis` object so the frontend does not pay vision tokens twice.
- Groq free tier is fine for prototyping, but it is still rate-limited.
