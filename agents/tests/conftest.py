import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from schemas.outputs import HunterOutput, DiggerOutput, QuantOutput, SkepticOutput


@pytest.fixture
def mock_hunter_output():
    return HunterOutput(
        company_profile="CloudSync Pro is a B2B SaaS platform.",
        industry="Enterprise Software",
        key_products=["Data Sync", "API Gateway", "ETL Pipeline"],
        founding_year="2019",
        headquarters="San Francisco, CA",
        employee_count="150",
        recent_news=["Series B funding", "New enterprise clients"],
    )


@pytest.fixture
def mock_digger_output():
    return DiggerOutput(
        market_size="$19.6B by 2028",
        competitive_landscape="Competing against MuleSoft, Boomi, Fivetran",
        market_position="Differentiated by real-time sync capability",
        key_findings=[
            "Market growing at 12.3% CAGR",
            "Sub-second latency is key differentiator",
        ],
        citations=[],
    )


@pytest.fixture
def mock_quant_output():
    return QuantOutput(
        revenue="$12.4M ARR",
        growth_rate="+78% YoY",
        gross_margin="82%",
        net_retention="124%",
        ltv_cac="4.2x",
        additional_metrics={"customers": "340+"},
        citations=[],
    )


@pytest.fixture
def mock_skeptic_output():
    return SkepticOutput(
        risks=[
            {"text": "Top 3 customers = 34% ARR", "provenance": "vdr"},
            {"text": "Technical debt requiring $2-3M investment", "provenance": "estimate"},
        ],
        risk_rating="medium",
        mitigations=["Diversify customer base", "Invest in infrastructure"],
        citations=[],
    )


@pytest.fixture
def mock_claude_client():
    with patch("services.claude_client.ClaudeClient") as mock:
        instance = mock.return_value
        instance.generate_structured = AsyncMock()
        yield instance


@pytest.fixture
def mock_pinecone_rag():
    with patch("services.pinecone_client.PineconeRAG") as mock:
        instance = mock.return_value
        instance.query = AsyncMock(return_value=[])
        instance.query_multiple = AsyncMock(return_value=[])
        yield instance


@pytest.fixture
def mock_progress_reporter():
    with patch("services.progress_reporter.ProgressReporter") as mock:
        instance = mock.return_value
        instance.agent_started = AsyncMock()
        instance.agent_progress = AsyncMock()
        instance.agent_completed = AsyncMock()
        instance.run_complete = AsyncMock()
        instance.run_error = AsyncMock()
        yield instance
