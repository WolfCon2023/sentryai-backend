from graph.state import AgentGraphState
from services.claude_client import ClaudeClient
from services.pinecone_client import PineconeRAG
from services.progress_reporter import ProgressReporter
from prompts.digger import get_digger_prompt
from schemas.outputs import DiggerOutput
from config import settings


async def digger_node(state: AgentGraphState) -> dict:
    reporter = ProgressReporter(settings.node_api_url, settings.internal_api_key)
    agent_id = "digger"

    await reporter.agent_started(state["run_id"], agent_id, "Digger")

    try:
        rag = PineconeRAG()
        client = ClaudeClient()

        await reporter.agent_progress(state["run_id"], agent_id, 20)

        # Query for market/competitive chunks
        queries = [
            f"{state['company_name']} market size TAM SAM",
            f"{state['company_name']} competitive landscape competitors",
            f"{state['company_name']} market position differentiation",
        ]
        if state["run_type"] == "full":
            queries.extend([
                f"{state['company_name']} industry trends",
                f"{state['company_name']} go-to-market strategy",
            ])

        rag_context = await rag.query_multiple(
            namespace=state["pinecone_namespace"],
            queries=queries,
            top_k=5 if state["run_type"] == "quick" else 10,
        )

        await reporter.agent_progress(state["run_id"], agent_id, 50)

        prompt = get_digger_prompt(
            company_name=state["company_name"],
            hunter_output=state["hunter_output"],
            rag_context=rag_context,
        )

        response = await client.generate_structured(
            prompt=prompt,
            output_schema=DiggerOutput,
            model="claude-sonnet-4-20250514"
            if state["run_type"] == "quick"
            else "claude-opus-4-20250514",
        )

        await reporter.agent_progress(state["run_id"], agent_id, 90)
        await reporter.agent_completed(state["run_id"], agent_id)

        return {"digger_output": response}
    except Exception as e:
        await reporter.agent_progress(state["run_id"], agent_id, 0)
        return {"error": f"Digger failed: {str(e)}"}
