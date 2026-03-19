from graph.state import AgentGraphState
from services.claude_client import ClaudeClient
from services.progress_reporter import ProgressReporter
from prompts.partner_quick import get_partner_quick_prompt
from prompts.partner_full import get_partner_full_prompt
from schemas.outputs import (
    PartnerOutput,
    QuickSnapshotOutput,
    InvestmentMemoOutput,
)
from config import settings


async def partner_node(state: AgentGraphState) -> dict:
    reporter = ProgressReporter(settings.node_api_url, settings.internal_api_key)
    agent_id = "partner"

    await reporter.agent_started(state["run_id"], agent_id, "Partner")

    try:
        client = ClaudeClient()

        await reporter.agent_progress(state["run_id"], agent_id, 20)

        if state["run_type"] == "quick":
            prompt = get_partner_quick_prompt(
                company_name=state["company_name"],
                hunter_output=state["hunter_output"],
                digger_output=state["digger_output"],
                quant_output=state["quant_output"],
                skeptic_output=state["skeptic_output"],
            )
            snapshot = await client.generate_structured(
                prompt=prompt,
                output_schema=QuickSnapshotOutput,
                model="claude-sonnet-4-20250514",
                max_tokens=8192,
            )
            output = PartnerOutput(
                run_type="quick",
                quick_snapshot=snapshot,
            )
        else:
            prompt = get_partner_full_prompt(
                company_name=state["company_name"],
                hunter_output=state["hunter_output"],
                digger_output=state["digger_output"],
                quant_output=state["quant_output"],
                skeptic_output=state["skeptic_output"],
            )
            memo = await client.generate_structured(
                prompt=prompt,
                output_schema=InvestmentMemoOutput,
                model="claude-opus-4-20250514",
                max_tokens=16384,
            )
            output = PartnerOutput(
                run_type="full",
                investment_memo=memo,
            )

        await reporter.agent_progress(state["run_id"], agent_id, 90)
        await reporter.agent_completed(state["run_id"], agent_id)

        return {"partner_output": output}
    except Exception as e:
        await reporter.agent_progress(state["run_id"], agent_id, 0)
        return {"error": f"Partner failed: {str(e)}"}
