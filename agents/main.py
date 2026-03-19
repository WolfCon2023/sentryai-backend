from fastapi import FastAPI, BackgroundTasks, HTTPException
from config import settings
from schemas.inputs import RunRequest
from graph.builder import build_graph

app = FastAPI(title="SentryAI Agent Service")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/run", status_code=202)
async def start_run(request: RunRequest, background_tasks: BackgroundTasks):
    graph = build_graph()
    background_tasks.add_task(execute_run, graph, request)
    return {"message": "Run started", "run_id": request.run_id}


async def execute_run(graph, request: RunRequest):
    from services.progress_reporter import ProgressReporter

    reporter = ProgressReporter(
        node_api_url=settings.node_api_url,
        api_key=settings.internal_api_key,
    )

    try:
        initial_state = {
            "deal_id": request.deal_id,
            "company_name": request.company_name,
            "company_url": request.company_url,
            "run_id": request.run_id,
            "run_type": request.run_type,
            "pinecone_namespace": f"deal-{request.deal_id}",
            "hunter_output": None,
            "digger_output": None,
            "quant_output": None,
            "skeptic_output": None,
            "partner_output": None,
            "error": None,
        }

        result = await graph.ainvoke(initial_state)

        if result.get("error"):
            await reporter.run_error(request.run_id, result["error"])
        else:
            await reporter.run_complete(
                run_id=request.run_id,
                deal_id=request.deal_id,
                output=result.get("partner_output"),
            )
    except Exception as e:
        await reporter.run_error(request.run_id, str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.port)
