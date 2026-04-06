from __future__ import annotations

import json
import re
from typing import Any


CODE_BLOCK_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


def extract_json_candidate(text: str) -> str:
    cleaned = (text or "").strip()
    if not cleaned:
        raise ValueError("Model response was empty.")

    code_block = CODE_BLOCK_RE.search(cleaned)
    if code_block:
        return code_block.group(1).strip()

    start_object = cleaned.find("{")
    end_object = cleaned.rfind("}")
    if start_object != -1 and end_object != -1 and end_object > start_object:
        return cleaned[start_object : end_object + 1].strip()

    start_array = cleaned.find("[")
    end_array = cleaned.rfind("]")
    if start_array != -1 and end_array != -1 and end_array > start_array:
        return cleaned[start_array : end_array + 1].strip()

    return cleaned


def parse_json_payload(text: str) -> Any:
    candidate = extract_json_candidate(text)
    return json.loads(candidate)
