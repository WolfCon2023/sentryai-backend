import httpx


class ProgressReporter:
    def __init__(self, node_api_url: str, api_key: str):
        self.base_url = node_api_url
        self.headers = {"X-Internal-API-Key": api_key, "Content-Type": "application/json"}

    async def agent_started(self, run_id: str, agent_id: str, agent_name: str):
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.base_url}/api/internal/progress",
                json={
                    "runId": run_id,
                    "agentId": agent_id,
                    "agentName": agent_name,
                    "status": "running",
                    "progress": 0,
                },
                headers=self.headers,
            )

    async def agent_progress(self, run_id: str, agent_id: str, progress: int):
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.base_url}/api/internal/progress",
                json={
                    "runId": run_id,
                    "agentId": agent_id,
                    "status": "running",
                    "progress": progress,
                },
                headers=self.headers,
            )

    async def agent_completed(self, run_id: str, agent_id: str):
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.base_url}/api/internal/progress",
                json={
                    "runId": run_id,
                    "agentId": agent_id,
                    "status": "complete",
                    "progress": 100,
                },
                headers=self.headers,
            )

    async def run_complete(self, run_id: str, deal_id: str, output: object):
        async with httpx.AsyncClient() as client:
            output_data = output.model_dump() if hasattr(output, "model_dump") else output
            await client.post(
                f"{self.base_url}/api/internal/run-complete",
                json={
                    "runId": run_id,
                    "dealId": deal_id,
                    "output": output_data,
                },
                headers=self.headers,
            )

    async def run_error(self, run_id: str, error: str):
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.base_url}/api/internal/run-error",
                json={"runId": run_id, "error": error},
                headers=self.headers,
            )
