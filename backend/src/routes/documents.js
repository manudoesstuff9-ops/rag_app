const express = require('express');
const {
  getAllDocuments,
  getDocumentById,
  createDocument,
  deleteDocument,
} = require('../controllers/documentController');

const router = express.Router();

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/', createDocument);
router.delete('/:id', deleteDocument);

module.exports = router;