class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error occurred";
  let errors = err.errors || [{ msg: message }];

  // Prisma Error Handling
  if (err.code && err.code.startsWith("P")) {
    switch (err.code) {
      case "P2002": // Unique constraint failed
        statusCode = 400;
        message = `Unique constraint failed on field(s): ${err.meta?.target || "unknown"}`;
        errors = [{ msg: message, field: err.meta?.target }];
        break;
      case "P2025": // Record to update/delete not found
        statusCode = 404;
        message = err.meta?.cause || "Record not found";
        errors = [{ msg: message }];
        break;
      case "P2003": // Foreign key constraint failed
        statusCode = 400;
        message = `Foreign key constraint failed on field: ${err.meta?.field_name || "unknown"}`;
        errors = [{ msg: message, field: err.meta?.field_name }];
        break;
      default:
        statusCode = 400;
        message = `Database error: ${err.message}`;
        errors = [{ msg: message }];
        break;
    }
  }

  // Multer Error Handling
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Max size allowed is 10MB.";
      errors = [{ msg: message }];
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

// Hybrid export to support both default function require and named property destructuring
module.exports = errorHandler;
module.exports.errorHandler = errorHandler;
module.exports.APIError = APIError;
