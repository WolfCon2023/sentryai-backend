import json
import re
from typing import Type, TypeVar
from anthropic import AsyncAnthropic
from pydantic import BaseModel
from config import settings

T = TypeVar("T", bound=BaseModel)


class ClaudeClient:
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def generate_structured(
        self,
        prompt: str,
        output_schema: Type[T],
        model: str = "claude-sonnet-4-20250514",
        max_tokens: int = 4096,
    ) -> T:
        schema_json = json.dumps(output_schema.model_json_schema(), indent=2)

        print(f"[Claude] Calling {model} for {output_schema.__name__} (max_tokens={max_tokens})...")

        for attempt in range(2):
            response = await self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                system=f"""You are an expert investment analyst. Always respond with valid JSON matching this schema exactly:

{schema_json}

Do not include any text outside the JSON object. Do not wrap in markdown code blocks. Keep content concise to fit within token limits.""",
            )

            content = response.content[0].text
            stop_reason = response.stop_reason
            print(f"[Claude] Response: {len(content)} chars, stop_reason={stop_reason}")

            # If output was truncated, retry with more tokens
            if stop_reason == "end_turn":
                break
            elif stop_reason == "max_tokens" and attempt == 0:
                print(f"[Claude] Response truncated, retrying with {max_tokens * 2} tokens...")
                max_tokens *= 2
                continue
            else:
                break

        # Strip markdown code fences if present
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        parsed = json.loads(cleaned)
        return output_schema.model_validate(parsed)
