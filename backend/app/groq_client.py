from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from .config import Settings
from .parsing import parse_json_payload


class GroqApiError(RuntimeError):
    """Raised when Groq cannot complete a request."""


class GroqClient:
    def __init__(self, settings: Settings, client: httpx.AsyncClient) -> None:
        self.settings = settings
        self.client = client

    def _ensure_configured(self) -> None:
        if not self.settings.groq_is_configured:
            raise GroqApiError("Groq is not configured. Set GROQ_API_KEY in backend/.env.")

    def _url(self) -> str:
        return f"{self.settings.groq_base_url}/chat/completions"

    async def _post_chat(self, payload: Dict[str, Any]) -> str:
        self._ensure_configured()
        response = await self.client.post(
            self._url(),
            headers={
                "Authorization": f"Bearer {self.settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

        if response.status_code >= 400:
            raise GroqApiError(f"Groq request failed with {response.status_code}: {response.text}")

        data = response.json()
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise GroqApiError("Groq returned an unexpected response shape.") from exc

        if isinstance(content, list):
            parts: List[str] = []
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    parts.append(str(item.get("text", "")))
            return "\n".join(part for part in parts if part).strip()

        return str(content).strip()

    async def chat_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2400,
        model: Optional[str] = None,
    ) -> str:
        payload = {
            "model": model or self.settings.groq_text_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        return await self._post_chat(payload)

    async def chat_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        max_tokens: int = 2400,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        raw = await self.chat_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            model=model,
        )
        parsed = parse_json_payload(raw)
        if not isinstance(parsed, dict):
            raise GroqApiError("Expected JSON object from Groq.")
        return parsed

    async def vision_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        image_data_uri: str,
        temperature: float = 0.1,
        max_tokens: int = 2400,
    ) -> Dict[str, Any]:
        payload = {
            "model": self.settings.groq_vision_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {"type": "image_url", "image_url": {"url": image_data_uri}},
                    ],
                },
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        raw = await self._post_chat(payload)
        parsed = parse_json_payload(raw)
        if not isinstance(parsed, dict):
            raise GroqApiError("Expected JSON object from Groq vision response.")
        return parsed
