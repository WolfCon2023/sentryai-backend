from graph.state import AgentGraphState
from services.claude_client import ClaudeClient
from services.progress_reporter import ProgressReporter
from prompts.hunter import get_hunter_prompt
from schemas.outputs import HunterOutput
from config import settings


async def hunter_node(state: AgentGraphState) -> dict:
    reporter = ProgressReporter(settings.node_api_url, settings.internal_api_key)
    agent_id = "hunter"

    await reporter.agent_started(state["run_id"], agent_id, "Hunter")

    try:
        client = ClaudeClient()
        prompt = get_hunter_prompt(
            company_name=state["company_name"],
            company_url=state["company_url"],
        )

        await reporter.agent_progress(state["run_id"], agent_id, 30)

        response = await client.generate_structured(
            prompt=prompt,
            output_schema=HunterOutput,
            model="claude-sonnet-4-20250514"
            if state["run_type"] == "quick"
            else "claude-opus-4-20250514",
        )

        await reporter.agent_progress(state["run_id"], agent_id, 90)
        await reporter.agent_completed(state["run_id"], agent_id)

        return {"hunter_output": response}
    except Exception as e:
        await reporter.agent_progress(state["run_id"], agent_id, 0)
        return {"error": f"Hunter failed: {str(e)}"}
