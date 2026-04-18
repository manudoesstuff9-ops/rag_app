const express = require('express');
const { AppError } = require('../middleware/errorHandler');
const pool = require('../config/database');

const router = express.Router();

router.post('/query', async (req, res, next) => {
  try {
    const { query, k } = req.body;

    if (!query) {
      return next(new AppError(400, 'Query is required'));
    }

    // Simple RAG implementation - search for relevant documents
    const result = await pool.query(
      'SELECT * FROM document_chunks WHERE content ILIKE $1 LIMIT $2',
      [`%${query}%`, k || 3]
    );

    res.status(200).json({
      success: true,
      data: {
        query: query,
        results: result.rows,
        count: result.rows.length
      },
    });
  } catch (error) {
    console.error('RAG Query Error:', error.message);
    next(new AppError(500, 'Failed to process RAG query'));
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const response = await axios.get(`${RAG_SERVICE_URL}/api/rag/stats`);

    res.status(200).json({
      success: true,
      data: response.data.stats,
    });
  } catch (error) {
    console.error('RAG Stats Error:', error.message);
    next(new AppError(500, 'Failed to fetch RAG statistics'));
  }
});

router.get('/documents', async (req, res, next) => {
  try {
    const response = await axios.get(`${RAG_SERVICE_URL}/api/rag/documents`);

    res.status(200).json({
      success: true,
      documents: response.data.documents,
      count: response.data.count,
    });
  } catch (error) {
    console.error('RAG Documents Error:', error.message);
    next(new AppError(500, 'Failed to fetch RAG documents'));
  }
});

router.post('/documents', async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return next(new AppError(400, 'Document text is required'));
    }

    const response = await axios.post(`${RAG_SERVICE_URL}/api/rag/documents`, {
      text,
    });

    res.status(201).json({
      success: true,
      message: response.data.message,
      documents_count: response.data.documents_count,
    });
  } catch (error) {
    console.error('RAG Add Document Error:', error.message);
    next(new AppError(500, 'Failed to add document to RAG system'));
  }
});

router.post('/documents/clear', async (req, res, next) => {
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/api/rag/documents/clear`);

    res.status(200).json({
      success: true,
      message: response.data.message,
    });
  } catch (error) {
    console.error('RAG Clear Documents Error:', error.message);
    next(new AppError(500, 'Failed to clear RAG documents'));
  }
});

module.exports = router;