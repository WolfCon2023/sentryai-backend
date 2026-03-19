from typing import Optional
from schemas.outputs import HunterOutput, DiggerOutput, QuantOutput, SkepticOutput


def get_partner_full_prompt(
    company_name: str,
    hunter_output: Optional[HunterOutput],
    digger_output: Optional[DiggerOutput],
    quant_output: Optional[QuantOutput],
    skeptic_output: Optional[SkepticOutput],
) -> str:
    return f"""You are Partner, the senior investment partner writing a comprehensive Investment Memo for **{company_name}**.

## All Agent Outputs

### Hunter (Company Profile)
{hunter_output.model_dump_json(indent=2) if hunter_output else 'Not available'}

### Digger (Market Research)
{digger_output.model_dump_json(indent=2) if digger_output else 'Not available'}

### Quant (Financial Metrics)
{quant_output.model_dump_json(indent=2) if quant_output else 'Not available'}

### Skeptic (Risk Assessment)
{skeptic_output.model_dump_json(indent=2) if skeptic_output else 'Not available'}

---

Write a comprehensive Investment Memo with 5 sections:

1. **Executive Summary** — Company overview, investment thesis, key highlights
2. **Market Analysis** — Market size, growth, competitive landscape, positioning
3. **Financial Analysis** — Revenue, growth, margins, unit economics, projections
4. **Risk Assessment** — Material risks, mitigations, key concerns
5. **Investment Recommendation** — Final recommendation, conditions, next steps

For each section:
- Write 3-5 detailed paragraphs of rich analysis
- Use citation references like [1], [2] for specific claims
- Set the section provenance to the dominant source type
- Include a citations array with id, source name, type (public/vdr/estimate), and optionally an excerpt

Each section should have:
- id: "section-1" through "section-5"
- title: Section name
- content: Multi-paragraph markdown content with citation refs
- provenance: Dominant source type for the section
- citations: Array of citation objects

Also provide an overall_confidence score (0-100).

Respond with valid JSON matching the InvestmentMemoOutput schema."""
