const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error occurred";
  const errors = err.errors || [{ msg: message }];

  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = errorHandler;
