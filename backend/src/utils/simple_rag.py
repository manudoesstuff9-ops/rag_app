import json
import sys
import re
from typing import Dict, List


STOPWORDS = {
    'the', 'is', 'are', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'and', 'or',
    'what', 'who', 'when', 'where', 'why', 'how', 'tell', 'about', 'me', 'does', 'do', 'did'
}


def normalize_token(token: str) -> str:
    if len(token) > 5 and token.endswith('ing'):
        return token[:-3]
    if len(token) > 4 and token.endswith('ed'):
        return token[:-2]
    if len(token) > 4 and token.endswith('es'):
        return token[:-2]
    if len(token) > 3 and token.endswith('s'):
        return token[:-1]
    return token


def tokenize(text: str) -> List[str]:
    tokens = re.findall(r"[a-zA-Z0-9]+", text.lower())
    cleaned = [token for token in tokens if len(token) > 1 and token not in STOPWORDS]
    return [normalize_token(token) for token in cleaned]


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
    scored = []

    for chunk in chunks:
        score = score_chunk(query_tokens, chunk)
        if score > 0:
            scored.append((score, chunk))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [{"text": text, "score": float(score)} for score, text in scored[:k]]


def build_snippet(chunk: str, query_tokens: List[str], window: int = 180) -> str:
    lowered = chunk.lower()
    best_pos = -1

    for token in query_tokens:
        pos = lowered.find(token)
        if pos != -1:
            best_pos = pos
            break

    if best_pos == -1:
        return chunk[:window].strip()

    start = max(0, best_pos - 30)
    end = min(len(chunk), start + window)
    snippet = chunk[start:end].strip()

    if start > 0:
        snippet = '...' + snippet
    if end < len(chunk):
        snippet = snippet + '...'

    return snippet


def generate_answer(query: str, retrieved_chunks: List[Dict[str, object]]) -> str:
    if not retrieved_chunks:
        return f"I could not find relevant context for: {query}"

    query_tokens = tokenize(query)
    snippets = [
        build_snippet(str(item["text"]), query_tokens)
        for item in retrieved_chunks[:2]
    ]
    return f"Based on retrieved document context: {' '.join(snippets)}"


def rag_pipeline(query: str, chunks: List[str], k: int = 3) -> Dict[str, object]:
    retrieved = retrieve(query, chunks, k)
    answer =generate_answer(query, retrieved)

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
        print(json.dumps({
            "query": payload.get("query", "") if 'payload' in locals() else "",
            "retrieved_chunks": [],
            "answer": f"Error: {str(exc)}"
        }))


if __name__ == "__main__":
    main()



