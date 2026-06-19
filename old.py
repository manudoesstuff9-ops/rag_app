import argparse
from typing import Dict, List


def chunk_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    step = chunk_size - overlap
    chunks = []
    for i in range(0, len(text), step):
        chunk = text[i : i + chunk_size]
        if chunk:
            chunks.append(chunk)
    return chunks


def simple_retrieve(query: str, chunks: List[str], k: int = 3) -> List[Dict[str, str]]:
    query_terms = set(query.lower().split())
    scored = []

    for chunk in chunks:
        terms = set(chunk.lower().split())
        score = len(query_terms.intersection(terms))
        scored.append((score, chunk))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        {"text": chunk, "score": str(score)}
        for score, chunk in scored[:k]
        if score > 0
    ]


def generate_answer(query: str, retrieved_chunks: List[Dict[str, str]]) -> str:
    if not retrieved_chunks:
        return f"No matching context found for: {query}"

    context = " ".join(item["text"] for item in retrieved_chunks)
    return f"Answer based on retrieved context: {context[:400]}"


def rag_pipeline(query: str) -> Dict[str, object]:
    documents = [
        "RAG stands for Retrieval Augmented Generation.",
        "FAISS is a library for efficient similarity search.",
        "Embeddings convert text into vectors.",
        "Chunking is the process of splitting text into smaller parts.",
        "Large Language Models generate text based on input context.",
    ]

    chunks = []
    for doc in documents:
        chunks.extend(chunk_text(doc, chunk_size=100, overlap=25))

    retrieved = simple_retrieve(query, chunks, k=3)
    answer = generate_answer(query, retrieved)

    return {
        "query": query,
        "retrieved_chunks": retrieved,
        "answer": answer,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run simple RAG pipeline")
    parser.add_argument("query", nargs="?", default="What is RAG?")
    args = parser.parse_args()

    result = rag_pipeline(args.query)
    print(result["answer"])


if __name__ == "__main__":
    main()
