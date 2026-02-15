export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: message,
      details: err.details || []
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message: message,
    ...(err.error_code && { error_code: err.error_code }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.statusCode = 400;
    this.name = 'ValidationError';
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
