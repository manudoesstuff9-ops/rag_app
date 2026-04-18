const express = require('express');
const router = express.Router();

const pool = require('../config/database');
const {AppError} = require('../middleware/errorHandler');

router.get('/',async(req, res, next) => {
    try{ 
        const result = await pool.query('select * from documents order by created_at desc');
        res.status(200).json({
            success: true,
            data: result.rows
        });
    }
    catch(error){
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'select * from documents where id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError(404, 'doc not found'));
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});
router.post('/', async (req, res, next) => {
  try {
    const { title, content, file_path } = req.body;

    if (!title || !content) {
      return next(new AppError(400, 'title and content'));
    }

    const result = await pool.query(
      'Insert into documents (title, content, file_path) values ($1, $2, $3) returning *',
      [title, content, file_path || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});


router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, file_path } = req.body;

    const result = await pool.query(
      `UPDATE documents 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content), 
           file_path = COALESCE($3, file_path), 
           updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [title || null, content || null, file_path || null, id]
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
}); 
router.delete('/:id', async (req, res, next) => {
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
});

module.exports = router;