from typing import Optional
from schemas.outputs import HunterOutput


def get_quant_prompt(
    company_name: str,
    hunter_output: Optional[HunterOutput],
    rag_context: list[dict],
) -> str:
    hunter_section = ""
    if hunter_output:
        hunter_section = f"""
## Company Context
{hunter_output.company_profile}
"""

    rag_section = ""
    if rag_context:
        rag_section = "\n## Data Room Financial Documents\n"
        for i, chunk in enumerate(rag_context, 1):
            rag_section += f"\n### Document {i} (Source: {chunk['fileName']})\n{chunk['text']}\n"

    return f"""You are Quant, the financial extraction agent for a PE/Growth Equity fund.

Your task is to extract and analyze financial metrics for **{company_name}**.

{hunter_section}
{rag_section}

Extract the following metrics (use null if not available, do not fabricate):
1. Revenue / ARR / MRR
2. Growth rate (YoY)
3. Gross margin
4. Net revenue retention
5. LTV/CAC ratio
6. Any additional relevant financial metrics

For each metric:
- Use exact figures from documents when available (tag as "vdr")
- Use publicly available data when confirmed (tag as "public")
- Clearly label any estimates or calculations you derive (tag as "estimate")
- Include citations with fileName and fileId for data room sources

Respond with valid JSON matching the QuantOutput schema."""
