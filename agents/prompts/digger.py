from typing import Optional
from schemas.outputs import HunterOutput


def get_digger_prompt(
    company_name: str,
    hunter_output: Optional[HunterOutput],
    rag_context: list[dict],
) -> str:
    hunter_section = ""
    if hunter_output:
        hunter_section = f"""
## Hunter's Company Profile
{hunter_output.company_profile}
Industry: {hunter_output.industry}
Key Products: {', '.join(hunter_output.key_products)}
"""

    rag_section = ""
    if rag_context:
        rag_section = "\n## Data Room Documents\n"
        for i, chunk in enumerate(rag_context, 1):
            rag_section += f"\n### Document {i} (Source: {chunk['fileName']})\n{chunk['text']}\n"

    return f"""You are Digger, the deep research agent for a PE/Growth Equity fund.

Your task is to analyze the market and competitive positioning for **{company_name}**.

{hunter_section}
{rag_section}

Based on all available information (public research + data room documents), provide:
1. Market size (TAM/SAM if available)
2. Competitive landscape analysis
3. Company's market position and differentiation
4. Key findings (list of 5-8 findings)
5. Citations for each claim — tag as "public" (web research), "vdr" (data room document), or "estimate" (your analysis)

For each citation from a data room document, include the fileName and fileId from the source.

Respond with valid JSON matching the DiggerOutput schema."""
