CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(50),
    file_size INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rag_queries (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    response TEXT,
    documents_used TEXT[],
    query_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_queries_date ON rag_queries(query_date DESC);

INSERT INTO documents (filename, content_type, file_size) 
VALUES ('sample.txt', 'text/plain', 1024)
ON CONFLICT DO NOTHING;
