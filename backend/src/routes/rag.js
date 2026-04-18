const express = require('express');
const path = require('path');
const { spawnSync } = require('child_process');
const { AppError } = require('../middleware/errorhandler');
const pool = require('../config/database');

const router = express.Router();
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || 'python';

function retrieveTopChunks(query, k) {
  return pool.query(
    'SELECT id, document_id, content FROM document_chunks WHERE content ILIKE $1 ORDER BY id DESC LIMIT $2',
    [`%${query}%`, k]
  );
}

function buildFallbackAnswer(query, rows) {
  if (!rows.length) {
    return `I could not find matching context for: ${query}`;
  }

  const context = rows.map((row) => row.content).join(' ');
  return `Based on the available documents, here is the closest context: ${context.slice(0, 400)}`;
}

function runPythonRag(query, rows, k) {
  const scriptPath = path.join(__dirname, '..', 'utils', 'simple_rag.py');
  const payload = {
    query,
    k,
    chunks: rows.map((row) => row.content),
  };

  const processResult = spawnSync(
    PYTHON_COMMAND,
    [scriptPath],
    {
      input: JSON.stringify(payload),
      encoding: 'utf-8',
      timeout: 15000,
    }
  );

  if (processResult.error) {
    throw processResult.error;
  }

  if (processResult.status !== 0) {
    throw new Error(processResult.stderr || 'Python RAG script failed');
  }

  const output = processResult.stdout ? processResult.stdout.trim() : '';
  if (!output) {
    throw new Error('Python RAG script returned empty output');
  }

  return JSON.parse(output);
}

router.post('/query', async (req, res, next) => {
  try {
    const { query, k } = req.body;
    const topK = Number(k) > 0 ? Number(k) : 3;

    if (!query || !String(query).trim()) {
      return next(new AppError(400, 'Query is required'));
    }

    const result = await retrieveTopChunks(query, topK);
    let pythonResult = null;
    let answer = '';
    let usedPython = false;

    try {
      pythonResult = runPythonRag(query, result.rows, topK);
      answer = pythonResult.answer;
      usedPython = true;
    } catch (pythonError) {
      console.warn('Python RAG fallback to JS:', pythonError.message);
      answer = buildFallbackAnswer(query, result.rows);
    }

    await pool.query(
      'INSERT INTO rag_queries (query, response, documents_used) VALUES ($1, $2, $3)',
      [
        query,
        answer,
        result.rows.map((row) => String(row.document_id || row.id)),
      ]
    );

    res.status(200).json({
      success: true,
      result: answer,
      data: {
        query,
        count: result.rows.length,
        used_python: usedPython,
        results: result.rows,
        retrieved_chunks: pythonResult ? pythonResult.retrieved_chunks : [],
      },
    });
  } catch (error) {
    console.error('RAG Query Error:', error.message);
    next(new AppError(500, 'Failed to process RAG query'));
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [documentsCount, chunksCount, queriesCount] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM documents'),
      pool.query('SELECT COUNT(*)::int AS count FROM document_chunks'),
      pool.query('SELECT COUNT(*)::int AS count FROM rag_queries'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        documents: documentsCount.rows[0].count,
        chunks: chunksCount.rows[0].count,
        queries: queriesCount.rows[0].count,
      },
    });
  } catch (error) {
    console.error('RAG Stats Error:', error.message);
    next(new AppError(500, 'Failed to fetch RAG statistics'));
  }
});

router.get('/documents', async (req, res, next) => {
  try {
    const documents = await pool.query('SELECT * FROM documents ORDER BY upload_date DESC');

    res.status(200).json({
      success: true,
      documents: documents.rows,
      count: documents.rows.length,
    });
  } catch (error) {
    console.error('RAG Documents Error:', error.message);
    next(new AppError(500, 'Failed to fetch RAG documents'));
  }
});

router.post('/documents', async (req, res, next) => {
  try {
    const { text, filename } = req.body;
    const safeFilename = filename || `doc-${Date.now()}.txt`;
    const content = text || safeFilename;

    const insertedDocument = await pool.query(
      'INSERT INTO documents (filename, content_type, file_size) VALUES ($1, $2, $3) RETURNING id, filename',
      [safeFilename, 'text/plain', content.length]
    );

    await pool.query(
      'INSERT INTO document_chunks (document_id, chunk_number, content) VALUES ($1, $2, $3)',
      [insertedDocument.rows[0].id, 1, content]
    );

    res.status(201).json({
      success: true,
      message: 'Document added to RAG system',
      documents_count: 1,
    });
  } catch (error) {
    console.error('RAG Add Document Error:', error.message);
    next(new AppError(500, 'Failed to add document to RAG system'));
  }
});

router.post('/documents/clear', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM document_chunks');
    await pool.query('DELETE FROM documents');

    res.status(200).json({
      success: true,
      message: 'All RAG documents cleared',
    });
  } catch (error) {
    console.error('RAG Clear Documents Error:', error.message);
    next(new AppError(500, 'Failed to clear RAG documents'));
  }
});

module.exports = router;