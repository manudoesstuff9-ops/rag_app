from fastapi import FastAPI
from pydantic import BaseModel

from simpleRAGapp import rag

app = FastAPI()


class QueryRequest(BaseModel):
    query: str


@app.post("/query")
def query_rag(data: QueryRequest):

    answer = rag.query(data.query)

    return {
        "answer": answer
    }