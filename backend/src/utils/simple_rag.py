import json
import re
import sys
from typing import Dict, List, Tuple


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9]+", text.lower())


def score_chunk(query_tokens: List[str], chunk: str) -> float:
    chunk_tokens = tokenize(chunk)
    if not chunk_tokens:
        return 0.0

    query_set = set(query_tokens)
    chunk_set = set(chunk_tokens)

    overlap = query_set.intersection(chunk_set)
    if not overlap:
        return 0.0

    return len(overlap) / max(len(query_set), 1)


def retrieve(query: str, chunks: List[str], k: int = 3) -> List[Dict[str, object]]:
    query_tokens = tokenize(query)
    scored: List[Tuple[float, str]] = []

    for chunk in chunks:
        score = score_chunk(query_tokens, chunk)
        scored.append((score, chunk))

    scored.sort(key=lambda item: item[0], reverse=True)
    top_scored = [item for item in scored if item[0] > 0][:k]

    return [{"text": text, "score": float(score)} for score, text in top_scored]


def generate_answer(query: str, retrieved_chunks: List[Dict[str, object]]) -> str:
    if not retrieved_chunks:
        return f"I could not find relevant context for: {query}"

    context = " ".join([str(item["text"]) for item in retrieved_chunks])
    return (
        "Based on retrieved document context: "
        + context[:500]
    )


def rag_pipeline(query: str, chunks: List[str], k: int = 3) -> Dict[str, object]:
    retrieved = retrieve(query, chunks, k)
    answer = generate_answer(query, retrieved)

    return {
        "query": query,
        "retrieved_chunks": retrieved,
        "answer": answer,
    }


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        query = str(payload.get("query", "")).strip()
        chunks = payload.get("chunks", [])
        k = int(payload.get("k", 3))

        if not query:
            raise ValueError("Query is required")

        if not isinstance(chunks, list):
            raise ValueError("Chunks must be a list")

        normalized_chunks = [str(chunk) for chunk in chunks if str(chunk).strip()]
        result = rag_pipeline(query, normalized_chunks, k)
        print(json.dumps(result))
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
