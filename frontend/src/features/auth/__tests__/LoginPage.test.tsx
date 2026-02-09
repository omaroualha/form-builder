import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { LoginPage } from "../pages/LoginPage";

vi.mock("@/api", () => ({
  api: {
    auth: {
      login: vi.fn(),
      getUser: vi.fn(),
    },
    setAccessToken: vi.fn(),
  },
}));

import { api } from "@/api";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("LoginPage", () => {
  it("renders email and password inputs", () => {
    renderWithProviders(<LoginPage />, { route: "/login" });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("has a link to register page", () => {
    renderWithProviders(<LoginPage />, { route: "/login" });

    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("submits credentials on form submit", async () => {
    const user = userEvent.setup();
    vi.mocked(api.auth.login).mockResolvedValue({
      token: "test-token",
      user: { id: 1, name: "Omar", email: "omar@example.com" },
    });

    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "omar@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith({
        email: "omar@example.com",
        password: "password123",
      });
    });
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    vi.mocked(api.auth.login).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "password");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /logging in/i }),
      ).toBeDisabled();
    });
  });

  it("shows error message when login fails (wrong credentials)", async () => {
    const user = userEvent.setup();
    const error = {
      response: { data: { message: "Invalid credentials" } },
      isAxiosError: true,
    };
    vi.mocked(api.auth.login).mockRejectedValue(error);

    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "wrong@test.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows error message on network failure", async () => {
    const user = userEvent.setup();
    const error = {
      response: { data: { message: "Network Error" } },
      isAxiosError: true,
    };
    vi.mocked(api.auth.login).mockRejectedValue(error);

    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "password");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });

  it("disables button while submitting to prevent double-click", async () => {
    const user = userEvent.setup();
    vi.mocked(api.auth.login).mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "password");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
    });

    // login should only be called once even though button was clicked
    expect(api.auth.login).toHaveBeenCalledTimes(1);
  });

  it("re-enables button after failed login attempt", async () => {
    const user = userEvent.setup();
    vi.mocked(api.auth.login).mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
      isAxiosError: true,
    });

    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^login$/i }),
      ).not.toBeDisabled();
    });
  });
});
