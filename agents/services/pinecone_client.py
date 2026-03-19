from pinecone import Pinecone
from config import settings


class PineconeRAG:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.pc.Index(settings.pinecone_index)

    async def query(
        self,
        namespace: str,
        query_text: str,
        top_k: int = 5,
    ) -> list[dict]:
        results = self.index.search(
            namespace=namespace,
            query={
                "inputs": {"text": query_text},
                "top_k": top_k,
            },
            fields=["text", "fileName", "fileId", "pageNumber", "chunkIndex"],
        )

        chunks = []
        for hit in results.get("result", {}).get("hits", []):
            fields = hit.get("fields", {})
            chunks.append(
                {
                    "text": fields.get("text", ""),
                    "fileName": fields.get("fileName", ""),
                    "fileId": fields.get("fileId", ""),
                    "pageNumber": fields.get("pageNumber"),
                    "score": hit.get("_score", 0),
                }
            )
        return chunks

    async def query_multiple(
        self,
        namespace: str,
        queries: list[str],
        top_k: int = 5,
    ) -> list[dict]:
        all_chunks: list[dict] = []
        seen_texts: set[str] = set()

        for q in queries:
            try:
                chunks = await self.query(namespace, q, top_k)
                for chunk in chunks:
                    text = chunk["text"]
                    if text and text not in seen_texts:
                        seen_texts.add(text)
                        all_chunks.append(chunk)
            except Exception as e:
                print(f"[Pinecone] Query failed for '{q[:50]}...': {e}")
                continue

        return all_chunks
