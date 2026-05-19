import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isVerified: true
    }
  }
};

const postSelect = (viewerId) => ({
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isVerified: true
    }
  },
  comments: {
    orderBy: {
      createdAt: "asc"
    },
    select: commentSelect
  },
  likes: viewerId
    ? {
        where: {
          userId: viewerId
        },
        select: {
          id: true
        }
      }
    : false,
  _count: {
    select: {
      likes: true,
      comments: true
    }
  }
});

const normalizePost = (post, viewerId) => ({
  id: post.id,
  content: post.content,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  user: post.user,
  comments: post.comments,
  likeCount: post._count.likes,
  commentCount: post._count.comments,
  isLiked: viewerId ? post.likes.length > 0 : false,
  canEdit: viewerId ? post.user.id === viewerId : false,
  canDelete: viewerId ? post.user.id === viewerId : false
});

const findOwnedPost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true
    }
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.userId !== userId) {
    throw new AppError("You can only modify your own posts", 403);
  }

  return post;
};

export const createPost = async (req, res, next) => {
  try {
    const userId = req.userId;
    const content = req.body.content?.trim();

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    if (!content) {
      throw new AppError("Content is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      throw new AppError("Invalid user", 401);
    }

    const post = await prisma.post.create({
      data: {
        content,
        userId
      },
      select: postSelect(userId)
    });

    return res.status(201).json({ post: normalizePost(post, userId) });
  } catch (error) {
    return next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const viewerId = req.userId;
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: postSelect(viewerId)
    });

    return res.status(200).json({ posts: posts.map((post) => normalizePost(post, viewerId)) });
  } catch (error) {
    return next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const content = req.body.content?.trim();

    if (!content) {
      throw new AppError("Content is required", 400);
    }

    await findOwnedPost(postId, req.userId);

    const post = await prisma.post.update({
      where: { id: postId },
      data: { content },
      select: postSelect(req.userId)
    });

    return res.status(200).json({ post: normalizePost(post, req.userId) });
  } catch (error) {
    return next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    await findOwnedPost(postId, req.userId);
    await prisma.post.delete({
      where: { id: postId }
    });

    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    return next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    try {
      await prisma.like.create({
        data: {
          postId,
          userId: req.userId
        }
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
        throw error;
      }
    }

    const likeCount = await prisma.like.count({ where: { postId } });

    return res.status(200).json({ isLiked: true, likeCount });
  } catch (error) {
    return next(error);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    await prisma.like.deleteMany({
      where: {
        postId,
        userId: req.userId
      }
    });

    const likeCount = await prisma.like.count({ where: { postId } });

    return res.status(200).json({ isLiked: false, likeCount });
  } catch (error) {
    return next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const content = req.body.content?.trim();

    if (!content) {
      throw new AppError("Comment content is required", 400);
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: req.userId
      },
      select: commentSelect
    });
    const commentCount = await prisma.comment.count({ where: { postId } });

    return res.status(201).json({ comment, commentCount });
  } catch (error) {
    return next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId, postId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        postId: true
      }
    });

    if (!comment || comment.postId !== postId) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.userId !== req.userId) {
      throw new AppError("You can only delete your own comments", 403);
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });
    const commentCount = await prisma.comment.count({ where: { postId } });

    return res.status(200).json({ message: "Comment deleted", commentCount });
  } catch (error) {
    return next(error);
  }
};
