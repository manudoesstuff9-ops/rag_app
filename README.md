
## RAG Application

A full-stack Retrieval Augmented Generation (RAG) application with React frontend, Node.js backend, and PostgreSQL database.

```
docker-compose up --build

# Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

# Stop services
docker-compose down
```

### Services

**PostgreSQL (Port 5432)**
```bash
psql -h localhost -U postgres -d rag_app_db

# User: postgres
# Password: postgres_password (change in .env)
```

**Backend (Port 5000)**
- Node.js + Express
- Connected to PostgreSQL

**Frontend (Port 3000)**
- React 18
- Connected to Backend API

### Project Structure

```
rag_app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── documents.js
│   │   │   ├── health.js
│   │   │   └── rag.js
│   │   ├── utils/
│   │   └── index.js
│   ├── db/
│   │   └── init.sql
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── DocumentUpload.js
│   │   │   └── RAGQuery.js
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env
├── .env.example
└── README.md
```

### Database Schema

**Tables:**
- `documents` - Uploaded documents
- `document_chunks` - Text chunks from documents
- `rag_queries` - Query history and responses

### Available Endpoints

**Health Check:**
```
GET /api/health
```

**Document Management:**
```
POST /api/documents/upload        - Upload a document
GET /api/documents                - List documents
GET /api/documents/:id            - Get document details
```

**RAG Query:**
```
POST /api/rag/query               - Query documents using RAG
```

### Database Management

**Access PostgreSQL from Docker:**
```bash
docker exec -it rag-postgres psql -U postgres -d rag_app_db
```

**Backup database:**
```bash
docker exec rag-postgres pg_dump -U postgres rag_app_db > backup.sql
```

**Restore database:**
```bash
docker exec -i rag-postgres psql -U postgres rag_app_db < backup.sql
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change ports in `docker-compose.yml` |
| Database connection failed | Check `DB_HOST` (use `postgres` in Docker, `localhost` locally) |
| Container won't start | Check logs: `docker-compose logs <service-name>` |
| Frontend can't reach backend | Verify `REACT_APP_API_URL` environment variable |
| PostgreSQL permission denied | Check username and password in `.env` |
