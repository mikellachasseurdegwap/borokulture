import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "7d";

const prismaMock = {
  $transaction: jest.fn((operations) => Promise.all(operations)),
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  post: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  like: {
    create: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn()
  },
  comment: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  follow: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn()
  }
};

await jest.unstable_mockModule("../src/config/prisma.js", () => ({
  default: prismaMock
}));

const { default: app } = await import("../src/app.js");

const viewerId = "user-1";
const targetUserId = "user-2";
const token = jwt.sign({ userId: viewerId }, process.env.JWT_SECRET);

const auth = (requestBuilder) => requestBuilder.set("Authorization", `Bearer ${token}`);

const user = {
  id: viewerId,
  username: "mikel",
  displayName: "Mikel",
  avatarUrl: null,
  avatarPositionX: 50,
  avatarPositionY: 50,
  avatarScale: 1,
  isVerified: false
};

const post = {
  id: "post-1",
  content: "nouvelle publication",
  createdAt: new Date("2026-06-01T10:00:00.000Z"),
  updatedAt: new Date("2026-06-01T10:00:00.000Z"),
  media: [],
  user,
  comments: [],
  likes: [],
  _count: {
    likes: 0,
    comments: 0
  }
};

const comment = {
  id: "comment-1",
  content: "super post",
  createdAt: new Date("2026-06-01T10:05:00.000Z"),
  user
};

describe("social routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation((operations) => Promise.all(operations));
  });

  test("rejects post creation without authentication", async () => {
    const response = await request(app).post("/posts").send({
      content: "sans token"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication token is required");
    expect(prismaMock.post.create).not.toHaveBeenCalled();
  });

  test("creates a post for the authenticated user", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: viewerId });
    prismaMock.post.create.mockResolvedValueOnce(post);

    const response = await auth(request(app).post("/posts")).send({
      content: " nouvelle publication "
    });

    expect(response.status).toBe(201);
    expect(response.body.post.content).toBe("nouvelle publication");
    expect(response.body.post.canEdit).toBe(true);
    expect(prismaMock.post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: "nouvelle publication",
          userId: viewerId
        })
      })
    );
  });

  test("returns paginated posts", async () => {
    prismaMock.post.findMany.mockResolvedValueOnce([post]);
    prismaMock.post.count.mockResolvedValueOnce(12);

    const response = await auth(request(app).get("/posts?page=2&limit=5"));

    expect(response.status).toBe(200);
    expect(response.body.posts).toHaveLength(1);
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 12,
      totalPages: 3,
      hasNextPage: true
    });
    expect(prismaMock.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5
      })
    );
  });

  test("likes and unlikes a post", async () => {
    prismaMock.post.findUnique.mockResolvedValueOnce({ id: post.id });
    prismaMock.like.create.mockResolvedValueOnce({ id: "like-1" });
    prismaMock.like.count.mockResolvedValueOnce(1);

    const likeResponse = await auth(request(app).post(`/posts/${post.id}/likes`));

    expect(likeResponse.status).toBe(200);
    expect(likeResponse.body).toEqual({ isLiked: true, likeCount: 1 });
    expect(prismaMock.like.create).toHaveBeenCalledWith({
      data: {
        postId: post.id,
        userId: viewerId
      }
    });

    prismaMock.like.deleteMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.like.count.mockResolvedValueOnce(0);

    const unlikeResponse = await auth(request(app).delete(`/posts/${post.id}/likes`));

    expect(unlikeResponse.status).toBe(200);
    expect(unlikeResponse.body).toEqual({ isLiked: false, likeCount: 0 });
  });

  test("adds and deletes own comments", async () => {
    prismaMock.post.findUnique.mockResolvedValueOnce({ id: post.id });
    prismaMock.comment.create.mockResolvedValueOnce(comment);
    prismaMock.comment.count.mockResolvedValueOnce(1);

    const createResponse = await auth(request(app).post(`/posts/${post.id}/comments`)).send({
      content: " super post "
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.comment.content).toBe("super post");
    expect(createResponse.body.commentCount).toBe(1);
    expect(prismaMock.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: "super post",
          postId: post.id,
          userId: viewerId
        }
      })
    );

    prismaMock.comment.findUnique.mockResolvedValueOnce({
      id: comment.id,
      userId: viewerId,
      postId: post.id
    });
    prismaMock.comment.delete.mockResolvedValueOnce(comment);
    prismaMock.comment.count.mockResolvedValueOnce(0);

    const deleteResponse = await auth(request(app).delete(`/posts/${post.id}/comments/${comment.id}`));

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.commentCount).toBe(0);
    expect(prismaMock.comment.delete).toHaveBeenCalledWith({
      where: { id: comment.id }
    });
  });

  test("prevents deleting another user's comment", async () => {
    prismaMock.comment.findUnique.mockResolvedValueOnce({
      id: comment.id,
      userId: targetUserId,
      postId: post.id
    });

    const response = await auth(request(app).delete(`/posts/${post.id}/comments/${comment.id}`));

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You can only delete your own comments");
    expect(prismaMock.comment.delete).not.toHaveBeenCalled();
  });

  test("follows and unfollows another user", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: targetUserId });
    prismaMock.follow.upsert.mockResolvedValueOnce({ id: "follow-1" });
    prismaMock.follow.count.mockResolvedValueOnce(3);

    const followResponse = await auth(request(app).post("/search/users/alou/follow"));

    expect(followResponse.status).toBe(200);
    expect(followResponse.body).toEqual({ isFollowing: true, followerCount: 3 });
    expect(prismaMock.follow.upsert).toHaveBeenCalledWith({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: targetUserId
        }
      },
      create: {
        followerId: viewerId,
        followingId: targetUserId
      },
      update: {}
    });

    prismaMock.user.findUnique.mockResolvedValueOnce({ id: targetUserId });
    prismaMock.follow.deleteMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.follow.count.mockResolvedValueOnce(2);

    const unfollowResponse = await auth(request(app).delete("/search/users/alou/follow"));

    expect(unfollowResponse.status).toBe(200);
    expect(unfollowResponse.body).toEqual({ isFollowing: false, followerCount: 2 });
  });

  test("prevents following yourself", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: viewerId });

    const response = await auth(request(app).post("/search/users/mikel/follow"));

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Vous ne pouvez pas vous abonner a vous-meme");
    expect(prismaMock.follow.upsert).not.toHaveBeenCalled();
  });
});
