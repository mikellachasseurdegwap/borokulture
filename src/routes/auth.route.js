import { Router } from "express";
import { getMe, login, register, updateMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";
import { profileUpload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, profileUpload, updateMe);

export default router;
