import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new AppError("JWT_SECRET is not defined", 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      throw new AppError("Invalid token payload", 401);
    }

    req.userId = decoded.userId;
    req.user = decoded;

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError("Invalid or expired token", 401));
  }
};
