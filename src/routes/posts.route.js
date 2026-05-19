import { Router } from "express";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getPosts,
  likePost,
  unlikePost,
  updatePost
} from "../controllers/posts.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getPosts);
router.post("/", authMiddleware, createPost);
router.patch("/:postId", authMiddleware, updatePost);
router.delete("/:postId", authMiddleware, deletePost);
router.post("/:postId/likes", authMiddleware, likePost);
router.delete("/:postId/likes", authMiddleware, unlikePost);
router.post("/:postId/comments", authMiddleware, addComment);
router.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);

export default router;
