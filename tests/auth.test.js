import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "7d";

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
};

await jest.unstable_mockModule("../src/config/prisma.js", () => ({
  default: prismaMock
}));

const { default: app } = await import("../src/app.js");

const user = {
  id: "user-1",
  email: "test@example.com",
  username: "testuser",
  password: "",
  createdAt: new Date("2026-04-29T12:00:00.000Z")
};

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("register success", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    });

    const response = await request(app).post("/auth/register").send({
      email: user.email,
      username: user.username,
      password: "password123"
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(user.email);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: user.email,
          username: user.username,
          password: expect.any(String)
        })
      })
    );
  });

  test("register duplicate email", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(user);

    const response = await request(app).post("/auth/register").send({
      email: user.email,
      username: "anotheruser",
      password: "password123"
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Email already exists");
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  test("register invalid email", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "invalid-email",
      username: user.username,
      password: "password123"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid email format");
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  test("login success", async () => {
    const hashedPassword = await bcrypt.hash("password123", 12);

    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...user,
      password: hashedPassword
    });

    const response = await request(app).post("/auth/login").send({
      email: user.email,
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(user.email);
  });

  test("login wrong password", async () => {
    const hashedPassword = await bcrypt.hash("password123", 12);

    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...user,
      password: hashedPassword
    });

    const response = await request(app).post("/auth/login").send({
      email: user.email,
      password: "wrongpassword"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });
});
