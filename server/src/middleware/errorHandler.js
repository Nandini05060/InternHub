export function errorHandler(err, req, res, next) {
  console.error('[Internal Error]:', err.stack || err.message);

  const statusCode = err.statusCode || (err.code === 'INVALID_FILE_TYPE' || err.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

