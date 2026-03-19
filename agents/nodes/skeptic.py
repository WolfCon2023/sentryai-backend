from graph.state import AgentGraphState
from services.claude_client import ClaudeClient
from services.pinecone_client import PineconeRAG
from services.progress_reporter import ProgressReporter
from prompts.skeptic import get_skeptic_prompt
from schemas.outputs import SkepticOutput
from config import settings


async def skeptic_node(state: AgentGraphState) -> dict:
    reporter = ProgressReporter(settings.node_api_url, settings.internal_api_key)
    agent_id = "skeptic"

    await reporter.agent_started(state["run_id"], agent_id, "Skeptic")

    try:
        rag = PineconeRAG()
        client = ClaudeClient()

        await reporter.agent_progress(state["run_id"], agent_id, 20)

        queries = [
            f"{state['company_name']} risks challenges concerns",
            f"{state['company_name']} legal compliance regulatory",
            f"{state['company_name']} customer concentration churn",
        ]
        if state["run_type"] == "full":
            queries.extend([
                f"{state['company_name']} technical debt scalability",
                f"{state['company_name']} team turnover key person risk",
            ])

        rag_context = await rag.query_multiple(
            namespace=state["pinecone_namespace"],
            queries=queries,
            top_k=5 if state["run_type"] == "quick" else 10,
        )

        await reporter.agent_progress(state["run_id"], agent_id, 50)

        prompt = get_skeptic_prompt(
            company_name=state["company_name"],
            hunter_output=state["hunter_output"],
            digger_output=state["digger_output"],
            quant_output=state["quant_output"],
            rag_context=rag_context,
        )

        response = await client.generate_structured(
            prompt=prompt,
            output_schema=SkepticOutput,
            model="claude-sonnet-4-20250514"
            if state["run_type"] == "quick"
            else "claude-opus-4-20250514",
        )

        await reporter.agent_progress(state["run_id"], agent_id, 90)
        await reporter.agent_completed(state["run_id"], agent_id)

        return {"skeptic_output": response}
    except Exception as e:
        await reporter.agent_progress(state["run_id"], agent_id, 0)
        return {"error": f"Skeptic failed: {str(e)}"}
