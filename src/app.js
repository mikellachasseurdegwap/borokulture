import express from "express";
import cors from "cors";
import healthRoute from "./routes/health.route.js";
import authRoute from "./routes/auth.route.js";
import postsRoute from "./routes/posts.route.js";
import searchRoute from "./routes/search.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// CORS configuration - allow all origins for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

app.use("/health", healthRoute);
app.use("/auth", authRoute);
app.use("/posts", postsRoute);
app.use("/search", searchRoute);

app.use(errorMiddleware);

export default app;
