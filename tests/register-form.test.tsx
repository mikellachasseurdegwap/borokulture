/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const apiMock = {
  post: jest.fn()
};

const setTokenMock = jest.fn();
const routerMock = {
  push: jest.fn(),
  refresh: jest.fn()
};

jest.doMock("next/navigation", () => ({
  useRouter: () => routerMock
}));

jest.doMock("@/lib/api", () => ({
  __esModule: true,
  default: apiMock
}));

jest.doMock("@/lib/auth", () => ({
  setToken: setTokenMock
}));

const { RegisterForm } = require("@/components/auth/register-form") as typeof import("@/components/auth/register-form");

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Email")).not.toBeNull();
    expect(screen.getByLabelText("Nom d'utilisateur")).not.toBeNull();
    expect(screen.getByLabelText("Mot de passe")).not.toBeNull();
  });

  test("submit triggers API call and redirects", async () => {
    apiMock.post.mockResolvedValueOnce({
      data: {
        message: "User registered successfully",
        token: "token-123",
        user: {
          id: "user-1",
          email: "test@example.com",
          username: "testuser"
        }
      }
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), {
      target: { value: "testuser" }
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Créer un compte" }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith("/auth/register", {
        email: "test@example.com",
        username: "testuser",
        password: "password123"
      });
    });

    expect(setTokenMock).toHaveBeenCalledWith("token-123");
    expect(routerMock.push).toHaveBeenCalledWith("/profile");
  });
});
