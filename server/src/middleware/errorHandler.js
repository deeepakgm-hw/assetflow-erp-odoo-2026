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
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Internal Server Error";

  // Prisma Error Handling
  // Prisma error codes reference: https://www.prisma.io/docs/reference/api-reference/error-reference
  if (err.code && err.code.startsWith("P")) {
    switch (err.code) {
      case "P2002": // Unique constraint failed
        statusCode = 400;
        status = "fail";
        message = `Unique constraint failed on field(s): ${err.meta?.target || "unknown"}`;
        break;
      case "P2025": // Record to update/delete not found
        statusCode = 404;
        status = "fail";
        message = err.meta?.cause || "Record not found";
        break;
      case "P2003": // Foreign key constraint failed
        statusCode = 400;
        status = "fail";
        message = `Foreign key constraint failed on field: ${err.meta?.field_name || "unknown"}`;
        break;
      default:
        statusCode = 400;
        status = "fail";
        message = `Database error: ${err.message}`;
        break;
    }
  }

  // Multer Error Handling
  if (err.name === "MulterError") {
    statusCode = 400;
    status = "fail";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Max size allowed is 10MB.";
    }
  }

  const response = {
    status,
    message
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  APIError,
  errorHandler
};
