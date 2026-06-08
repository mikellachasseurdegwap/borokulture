import express from "express";
import cors from "cors";
import healthRoute from "./routes/health.route.js";
import authRoute from "./routes/auth.route.js";
import postsRoute from "./routes/posts.route.js";
import searchRoute from "./routes/search.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { AppError } from "./utils/app-error.js";

const app = express();

const parseClientUrls = () => {
  return (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
};

const getAllowedOrigins = () => {
  const origins = new Set(parseClientUrls());

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return origins;
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError("Origine non autorisee par CORS", 403));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

app.use("/health", healthRoute);
app.use("/auth", authRoute);
app.use("/posts", postsRoute);
app.use("/search", searchRoute);

app.use(errorMiddleware);

export default app;
