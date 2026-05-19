import { Router } from "express";
import prisma from "../config/prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/app-error.js";

const router = Router();

const userSearchSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  coverUrl: true,
  isVerified: true,
  createdAt: true,
  _count: {
    select: {
      posts: true,
      followers: true,
      following: true
    }
  }
};

const postSelect = (viewerId) => ({
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  media: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      url: true,
      mimeType: true,
      size: true,
      order: true,
      createdAt: true
    }
  },
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
    orderBy: { createdAt: "asc" },
    select: {
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
    }
  },
  likes: viewerId
    ? {
        where: { userId: viewerId },
        select: { id: true }
      }
    : false,
  _count: {
    select: {
      likes: true,
      comments: true
    }
  }
});

const normalizeUser = (user, viewerId, follow) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  coverUrl: user.coverUrl,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  postCount: user._count.posts,
  followerCount: user._count.followers,
  followingCount: user._count.following,
  isMe: viewerId === user.id,
  isFollowing: Boolean(follow)
});

const normalizePost = (post, viewerId) => ({
  id: post.id,
  content: post.content,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  media: post.media,
  user: post.user,
  comments: post.comments,
  likeCount: post._count.likes,
  commentCount: post._count.comments,
  isLiked: viewerId ? post.likes.length > 0 : false,
  canEdit: viewerId ? post.user.id === viewerId : false,
  canDelete: viewerId ? post.user.id === viewerId : false
});

router.get("/users", authMiddleware, async (req, res, next) => {
  try {
    const query = req.query.q?.trim();
    const queryLimit = Math.min(Number(req.query.limit) || 20, 50);

    if (!query) {
      return res.status(200).json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } }
        ]
      },
      take: queryLimit,
      orderBy: { createdAt: "desc" },
      select: userSearchSelect
    });

    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
});

router.get("/users/:username", authMiddleware, async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: userSearchSelect
    });

    if (!user) {
      throw new AppError("Utilisateur non trouve", 404);
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: user.id
        }
      },
      select: { id: true }
    });

    return res.status(200).json({ user: normalizeUser(user, req.userId, follow) });
  } catch (error) {
    return next(error);
  }
});

router.get("/users/:username/posts", authMiddleware, async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      throw new AppError("Utilisateur non trouve", 404);
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: postSelect(req.userId)
    });

    return res.status(200).json({ posts: posts.map((post) => normalizePost(post, req.userId)) });
  } catch (error) {
    return next(error);
  }
});

router.post("/users/:username/follow", authMiddleware, async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      throw new AppError("Utilisateur non trouve", 404);
    }

    if (user.id === req.userId) {
      throw new AppError("Vous ne pouvez pas vous abonner a vous-meme", 400);
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: user.id
        }
      },
      create: {
        followerId: req.userId,
        followingId: user.id
      },
      update: {}
    });

    const followerCount = await prisma.follow.count({ where: { followingId: user.id } });

    return res.status(200).json({ isFollowing: true, followerCount });
  } catch (error) {
    return next(error);
  }
});

router.delete("/users/:username/follow", authMiddleware, async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      throw new AppError("Utilisateur non trouve", 404);
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: req.userId,
        followingId: user.id
      }
    });

    const followerCount = await prisma.follow.count({ where: { followingId: user.id } });

    return res.status(200).json({ isFollowing: false, followerCount });
  } catch (error) {
    return next(error);
  }
});

export default router;
