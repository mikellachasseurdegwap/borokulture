import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_USERNAME_LENGTH = 32;
const MAX_DISPLAY_NAME_LENGTH = 80;
const MAX_BIO_LENGTH = 280;

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not defined", 500);
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

const userSelect = {
  id: true,
  email: true,
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

const normalizeUser = (user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  coverUrl: user.coverUrl,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  postCount: user._count?.posts ?? 0,
  followerCount: user._count?.followers ?? 0,
  followingCount: user._count?.following ?? 0
});

const validateLoginInput = (email, password) => {
  if (!email || !password) {
    return "Email and password are required";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Invalid email format";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return null;
};

const validateUsername = (username) => {
  if (!username) {
    return "Username is required";
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return `Username must contain at most ${MAX_USERNAME_LENGTH} characters`;
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return "Username can only contain letters, numbers, dots, underscores and dashes";
  }

  return null;
};

const validateRegisterInput = (email, username, password) => {
  const authError = validateLoginInput(email, password);

  if (authError) {
    return authError;
  }

  return validateUsername(username);
};

const uploadedFileUrl = (file) => {
  if (!file) {
    return undefined;
  }

  return `/uploads/profiles/${file.filename}`;
};

export const register = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const username = req.body.username?.trim();
    const { password } = req.body;

    const validationError = validateRegisterInput(email, username, password);

    if (validationError) {
      throw new AppError(validationError, 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      throw new AppError("Username already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user;

    try {
      user = await prisma.user.create({
        data: {
          email,
          username,
          displayName: username,
          password: hashedPassword
        },
        select: userSelect
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
        const field = target.includes("username") ? "Username" : "Email";

        throw new AppError(`${field} already exists`, 409);
      }

      throw new AppError("Unable to register user", 500);
    }

    const token = createToken(user.id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: normalizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    const validationError = validateLoginInput(email, password);

    if (validationError) {
      throw new AppError(validationError, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = createToken(user.id);

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: normalizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: userSelect
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return res.status(200).json({ user: normalizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const username = req.body.username?.trim();
    const displayName = req.body.displayName?.trim();
    const bio = req.body.bio?.trim();
    const data = {};

    if (username !== undefined) {
      const usernameError = validateUsername(username);

      if (usernameError) {
        throw new AppError(usernameError, 400);
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUsername && existingUsername.id !== req.userId) {
        throw new AppError("Username already exists", 409);
      }

      data.username = username;
    }

    if (displayName !== undefined) {
      if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
        throw new AppError(`Display name must contain at most ${MAX_DISPLAY_NAME_LENGTH} characters`, 400);
      }

      data.displayName = displayName || null;
    }

    if (bio !== undefined) {
      if (bio.length > MAX_BIO_LENGTH) {
        throw new AppError(`Bio must contain at most ${MAX_BIO_LENGTH} characters`, 400);
      }

      data.bio = bio || null;
    }

    const avatarFile = req.files?.avatar?.[0];
    const coverFile = req.files?.cover?.[0];
    const avatarUrl = uploadedFileUrl(avatarFile);
    const coverUrl = uploadedFileUrl(coverFile);

    if (avatarUrl) {
      data.avatarUrl = avatarUrl;
    }

    if (coverUrl) {
      data.coverUrl = coverUrl;
    }

    if (Object.keys(data).length === 0) {
      throw new AppError("No profile data provided", 400);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: userSelect
    });

    return res.status(200).json({ user: normalizeUser(user) });
  } catch (error) {
    return next(error);
  }
};
