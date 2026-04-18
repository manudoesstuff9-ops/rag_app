const pool = require('../config/database');
const { AppError } = require('../middleware/errorhandler');

const getAllDocuments = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM documents ORDER BY upload_date DESC');
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError(404, 'Document not found'));
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const createDocument = async (req, res, next) => {
  try {
    const { filename, content_type, file_size } = req.body;

    if (!filename) {
      return next(new AppError(400, 'Filename is required'));
    }

    const result = await pool.query(
      'INSERT INTO documents (filename, content_type, file_size) VALUES ($1, $2, $3) RETURNING *',
      [filename, content_type || 'text/plain', file_size || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Document added successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError(404, 'Document not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  deleteDocument,
};
