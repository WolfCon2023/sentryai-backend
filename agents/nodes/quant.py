from graph.state import AgentGraphState
from services.claude_client import ClaudeClient
from services.pinecone_client import PineconeRAG
from services.progress_reporter import ProgressReporter
from prompts.quant import get_quant_prompt
from schemas.outputs import QuantOutput
from config import settings


async def quant_node(state: AgentGraphState) -> dict:
    reporter = ProgressReporter(settings.node_api_url, settings.internal_api_key)
    agent_id = "quant"

    await reporter.agent_started(state["run_id"], agent_id, "Quant")

    try:
        rag = PineconeRAG()
        client = ClaudeClient()

        await reporter.agent_progress(state["run_id"], agent_id, 20)

        queries = [
            f"{state['company_name']} revenue ARR MRR financials",
            f"{state['company_name']} growth rate margins unit economics",
            f"{state['company_name']} financial model projections",
        ]
        if state["run_type"] == "full":
            queries.extend([
                f"{state['company_name']} LTV CAC retention churn",
                f"{state['company_name']} burn rate runway funding",
            ])

        rag_context = await rag.query_multiple(
            namespace=state["pinecone_namespace"],
            queries=queries,
            top_k=5 if state["run_type"] == "quick" else 10,
        )

        await reporter.agent_progress(state["run_id"], agent_id, 50)

        prompt = get_quant_prompt(
            company_name=state["company_name"],
            hunter_output=state["hunter_output"],
            rag_context=rag_context,
        )

        response = await client.generate_structured(
            prompt=prompt,
            output_schema=QuantOutput,
            model="claude-sonnet-4-20250514"
            if state["run_type"] == "quick"
            else "claude-opus-4-20250514",
        )

        await reporter.agent_progress(state["run_id"], agent_id, 90)
        await reporter.agent_completed(state["run_id"], agent_id)

        return {"quant_output": response}
    except Exception as e:
        await reporter.agent_progress(state["run_id"], agent_id, 0)
        return {"error": f"Quant failed: {str(e)}"}
