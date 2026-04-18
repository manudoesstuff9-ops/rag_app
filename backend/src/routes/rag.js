const express = require('express');
const {
  queryRag,
  getRagStats,
  getAllRagDocuments,
  addRagDocument,
  clearRagDocuments,
} = require('../controllers/ragController');

const router = express.Router();

router.post('/query', queryRag);
router.get('/stats', getRagStats);
router.get('/documents', getAllRagDocuments);
router.post('/documents', addRagDocument);
router.post('/documents/clear', clearRagDocuments);

module.exports = router;