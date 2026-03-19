from typing import Optional
from schemas.outputs import HunterOutput, DiggerOutput, QuantOutput


def get_skeptic_prompt(
    company_name: str,
    hunter_output: Optional[HunterOutput],
    digger_output: Optional[DiggerOutput],
    quant_output: Optional[QuantOutput],
    rag_context: list[dict],
) -> str:
    prior_outputs = f"""
## Prior Agent Findings

### Company Profile (Hunter)
{hunter_output.company_profile if hunter_output else 'Not available'}

### Market Analysis (Digger)
{digger_output.competitive_landscape if digger_output else 'Not available'}
Market Position: {digger_output.market_position if digger_output else 'N/A'}

### Financial Metrics (Quant)
Revenue: {quant_output.revenue if quant_output else 'N/A'}
Growth: {quant_output.growth_rate if quant_output else 'N/A'}
Gross Margin: {quant_output.gross_margin if quant_output else 'N/A'}
NRR: {quant_output.net_retention if quant_output else 'N/A'}
"""

    rag_section = ""
    if rag_context:
        rag_section = "\n## Risk-Related Documents\n"
        for i, chunk in enumerate(rag_context, 1):
            rag_section += f"\n### Document {i} (Source: {chunk['fileName']})\n{chunk['text']}\n"

    return f"""You are Skeptic, the adversarial risk analyst for a PE/Growth Equity fund.

Your task is to identify and assess ALL material risks for **{company_name}**.

{prior_outputs}
{rag_section}

Be thorough and adversarial. Challenge assumptions. Identify:
1. A comprehensive list of risks (5-10 items), each tagged with provenance
2. An overall risk rating (low / medium / high)
3. Potential mitigations for the top risks
4. Citations for risk claims from data room documents

Risk categories to consider:
- Customer concentration / churn risk
- Competitive threats
- Technical debt / scalability concerns
- Key person dependency
- Regulatory / compliance risks
- Financial sustainability
- Market timing / macro risks

Tag each risk as "public" (from public info), "vdr" (from data room), or "estimate" (your assessment).

Respond with valid JSON matching the SkepticOutput schema."""
