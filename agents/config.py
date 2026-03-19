from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index: str = "sentryai-docs"
    mongodb_uri: str = "mongodb://localhost:27017/sentryai"
    node_api_url: str = "http://localhost:3001"
    internal_api_key: str = ""
    port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
