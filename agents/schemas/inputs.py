from pydantic import BaseModel
from typing import Literal


class RunRequest(BaseModel):
    run_id: str
    deal_id: str
    company_name: str
    company_url: str
    run_type: Literal["quick", "full"]
