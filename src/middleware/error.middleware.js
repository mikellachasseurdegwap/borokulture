export const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Server error";

  if (!error.isOperational) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message
  });
};
