# Development Setup Guide

## RAG Application

A full-stack Retrieval Augmented Generation (RAG) application with React frontend, Node.js backend, and PostgreSQL database.

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- npm

### Quick Start with Docker

```bash
# Build and start all services
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
# Connect to database
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

### Local Development (without Docker)

**1. Setup PostgreSQL locally:**
```bash
# Mac (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/

# Linux
sudo apt-get install postgresql postgresql-contrib
```

**2. Create database:**
```bash
psql -U postgres -c "CREATE DATABASE rag_app_db;"
```

**3. Backend:**
```bash
cd backend
npm install
npm run dev
```

**4. Frontend:**
```bash
cd frontend
npm install
npm start
```

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

### Environment Variables

Copy `.env.example` to `.env` and customize:

```env
# Backend
PORT=5000
NODE_ENV=production

# Database
DB_HOST=postgres          # Use 'localhost' for local development
DB_PORT=5432
DB_NAME=rag_app_db
DB_USER=postgres
DB_PASSWORD=postgres_password  # Change this!

# Frontend
REACT_APP_API_URL=http://localhost:5000
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

### Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f postgres

# Stop services
docker-compose down

# Remove volumes (deletes database)
docker-compose down -v

# Rebuild specific service
docker-compose build --no-cache backend
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

### Security Notes

⚠️ **Before Production:**
- Change PostgreSQL password in `.env`
- Use strong database credentials
- Enable SSL/TLS for database connections
- Use environment-specific secret management
- Never commit `.env` file (already in `.gitignore`)

