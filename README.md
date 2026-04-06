# Sonarive

Sonarive is a modular health workspace built around practical user flows instead of one-off AI demos.

## Current stack

- Frontend: Next.js, React, Tailwind CSS, Radix UI, Leaflet
- Backend: FastAPI
- AI provider: Groq
- Maps: OpenStreetMap + Overpass + Leaflet

## Available modules

- Scan analysis
- Mental wellness check-in
- Drug research
- Treatment planning
- Second opinion
- Hospital finder

## Frontend run

```bash
npm install
npm run dev
```

## Backend run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # on Windows use .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env        # on Windows use copy .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Environment

Frontend:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Backend:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_TEXT_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
OVERPASS_BASE_URL=https://overpass-api.de/api/interpreter
```

## Notes

- The current scan workflow preserves the previous response contract by returning `highlightedArea` as the original image URI.
- Hospital search depends on OpenStreetMap coverage for the selected area.
- This app provides decision support, not medical diagnosis.
