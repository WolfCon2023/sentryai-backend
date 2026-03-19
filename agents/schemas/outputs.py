from pydantic import BaseModel
from typing import Optional, Literal


class Citation(BaseModel):
    id: str
    source: str
    type: Literal["public", "vdr", "estimate"]
    excerpt: Optional[str] = None
    file_id: Optional[str] = None
    page_number: Optional[int] = None


class MarketBullet(BaseModel):
    text: str
    provenance: Literal["public", "vdr", "estimate"]
    citation: Optional[Citation] = None


class KeyMetric(BaseModel):
    label: str
    value: str
    is_estimate: bool
    citation: Optional[Citation] = None


class TopRisk(BaseModel):
    text: str
    provenance: Literal["public", "vdr", "estimate"]


class MemoSection(BaseModel):
    id: str
    title: str
    content: str
    provenance: Literal["public", "vdr", "estimate"]
    citations: list[Citation] = []


class HunterOutput(BaseModel):
    company_profile: str
    industry: str
    key_products: list[str]
    founding_year: Optional[str] = None
    headquarters: Optional[str] = None
    employee_count: Optional[str] = None
    recent_news: list[str] = []


class DiggerOutput(BaseModel):
    market_size: Optional[str] = None
    competitive_landscape: str
    market_position: str
    key_findings: list[str]
    citations: list[Citation] = []


class QuantOutput(BaseModel):
    revenue: Optional[str] = None
    growth_rate: Optional[str] = None
    gross_margin: Optional[str] = None
    net_retention: Optional[str] = None
    ltv_cac: Optional[str] = None
    additional_metrics: dict[str, str] = {}
    citations: list[Citation] = []


class SkepticOutput(BaseModel):
    risks: list[TopRisk]
    risk_rating: Literal["low", "medium", "high"]
    mitigations: list[str] = []
    citations: list[Citation] = []


class QuickSnapshotOutput(BaseModel):
    summary: str
    market_bullets: list[MarketBullet]
    key_metrics: list[KeyMetric]
    top_risks: list[TopRisk]
    diligence_questions: list[str]
    overall_confidence: int


class InvestmentMemoOutput(BaseModel):
    sections: list[MemoSection]
    overall_confidence: int


class PartnerOutput(BaseModel):
    """Union output — either quick snapshot or full memo."""
    run_type: Literal["quick", "full"]
    quick_snapshot: Optional[QuickSnapshotOutput] = None
    investment_memo: Optional[InvestmentMemoOutput] = None
