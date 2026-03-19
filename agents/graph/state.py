from typing import Optional, Literal, TypedDict, Annotated
from schemas.outputs import (
    HunterOutput,
    DiggerOutput,
    QuantOutput,
    SkepticOutput,
    PartnerOutput,
)


def _keep_last(current: Optional[str], new: Optional[str]) -> Optional[str]:
    """Reducer: keep the latest non-None error."""
    return new if new is not None else current


class AgentGraphState(TypedDict):
    deal_id: str
    company_name: str
    company_url: str
    run_id: str
    run_type: Literal["quick", "full"]
    pinecone_namespace: str
    hunter_output: Optional[HunterOutput]
    digger_output: Optional[DiggerOutput]
    quant_output: Optional[QuantOutput]
    skeptic_output: Optional[SkepticOutput]
    partner_output: Optional[PartnerOutput]
    error: Annotated[Optional[str], _keep_last]
