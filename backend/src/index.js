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

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', healthRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/rag', ragRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server is running on port ${PORT}`);
});