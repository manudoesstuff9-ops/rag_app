import pickle
from pathlib import Path
from typing import List, Tuple

import faiss
import torch
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from transformers import AutoModelForCausalLM, AutoTokenizer


KNOWLEDGE_FILE = "knowledge.txt"
INDEX_FILE = "rag.index"
CHUNKS_FILE = "chunks.pkl"

EMBED_MODEL_NAME = "BAAI/bge-small-en-v1.5"
LLM_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"


def load_and_chunk_text(
    file_path: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
) -> List[str]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {file_path}")

    text = path.read_text(encoding="utf-8")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    chunks = splitter.split_text(text)
    if not chunks:
        raise ValueError("No chunks were created. Check your input text file.")

    return chunks


def build_faiss_index(
    chunks: List[str],
    embed_model: SentenceTransformer,
) -> faiss.Index:
    embeddings = embed_model.encode(
        chunks,
        convert_to_numpy=True,
        show_progress_bar=True,
    ).astype("float32")

    faiss.normalize_L2(embeddings)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    return index


def save_index_and_chunks(index: faiss.Index, chunks: List[str]) -> None:
    faiss.write_index(index, INDEX_FILE)
    with open(CHUNKS_FILE, "wb") as f:
        pickle.dump(chunks, f)


def load_index_and_chunks() -> Tuple[faiss.Index, List[str]]:
    index = faiss.read_index(INDEX_FILE)
    with open(CHUNKS_FILE, "rb") as f:
        chunks = pickle.load(f)
    return index, chunks


def retrieve(
    query: str,
    embed_model: SentenceTransformer,
    index: faiss.Index,
    chunks: List[str],
    k: int = 3,
) -> List[dict]:
    query_embedding = embed_model.encode(
        [query],
        convert_to_numpy=True,
    ).astype("float32")

    faiss.normalize_L2(query_embedding)

    scores, indices = index.search(query_embedding, k)

    results = []
    for idx, score in zip(indices[0], scores[0]):
        if idx == -1:
            continue
        results.append(
            {
                "text": chunks[idx],
                "score": float(score),
            }
        )

    return results


def load_llm() -> Tuple[AutoTokenizer, AutoModelForCausalLM, torch.device]:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    dtype = torch.float16 if device.type == "cuda" else torch.float32

    tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        LLM_MODEL_NAME,
        torch_dtype=dtype,
        low_cpu_mem_usage=True,
    )
    model.to(device)
    model.eval()

    return tokenizer, model, device


def generate_answer(
    query: str,
    retrieved_chunks: List[dict],
    tokenizer: AutoTokenizer,
    model: AutoModelForCausalLM,
    device: torch.device,
) -> str:
    if not retrieved_chunks:
        return f"No matching context found for: {query}"

    context = "\n\n".join(
        f"[{i+1}] {item['text']}" for i, item in enumerate(retrieved_chunks)
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. Use only the provided context to answer. "
                "If the answer is not in the context, say you do not know."
            ),
        },
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion:\n{query}",
        },
    ]

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=2048,
    ).to(device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id,
        )

    # Decode only the newly generated tokens, not the prompt itself.
    generated_tokens = outputs[0][inputs["input_ids"].shape[-1]:]
    answer = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

    return answer or "I do not know."


def main() -> None:
    print("Loading embedding model...")
    embed_model = SentenceTransformer(EMBED_MODEL_NAME)

    if Path(INDEX_FILE).exists() and Path(CHUNKS_FILE).exists():
        print("Loading saved FAISS index and chunks...")
        index, chunks = load_index_and_chunks()
    else:
        print("Building index from knowledge.txt...")
        chunks = load_and_chunk_text(KNOWLEDGE_FILE)
        index = build_faiss_index(chunks, embed_model)
        save_index_and_chunks(index, chunks)
        print("Index saved.")

    print("Loading local model...")
    tokenizer, model, device = load_llm()

    while True:
        query = input("\nEnter query (or type 'exit'): ").strip()
        if query.lower() == "exit":
            break
        if not query:
            continue

        retrieved_chunks = retrieve(
            query=query,
            embed_model=embed_model,
            index=index,
            chunks=chunks,
            k=3,
        )

        print("\nRetrieved chunks:")
        for item in retrieved_chunks:
            print(f"- score={item['score']:.4f} | {item['text'][:200]}")

        answer = generate_answer(
            query=query,
            retrieved_chunks=retrieved_chunks,
            tokenizer=tokenizer,
            model=model,
            device=device,
        )

        print("\nAnswer:")
        print(answer)


if __name__ == "__main__":
    main()