const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] ${status}: ${message}`);

  res.status(status).json({
    status,
    message,
    timestamp: new Date().toISOString(),
  });
};

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

module.exports = { errorHandler, AppError };