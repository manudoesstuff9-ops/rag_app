const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const { corsMiddleware } = require('./middleware/cors');
const { errorHandler } = require('./middleware/errorhandler');

const healthRoutes = require('./routes/health');
const documentsRoutes = require('./routes/documents');
const ragRoutes = require('./routes/rag');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/rag', ragRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server is running on port ${PORT}`);
});