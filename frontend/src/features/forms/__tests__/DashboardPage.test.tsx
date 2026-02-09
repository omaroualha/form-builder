import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { DashboardPage } from "../pages/DashboardPage";

vi.mock("@/api", () => ({
  api: {
    auth: {
      getUser: vi.fn(),
      logout: vi.fn(),
    },
    forms: {
      getAll: vi.fn(),
      remove: vi.fn(),
    },
    setAccessToken: vi.fn(),
  },
}));

import { api } from "@/api";

const mockForms = [
  {
    id: "1",
    title: "Contact Form",
    slug: "contact-form-abc123",
    fields: [
      { type: "text" as const, label: "Name", name: "name", required: true },
    ],
    status: "published" as const,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "2",
    title: "Survey",
    slug: "survey-def456",
    fields: [],
    status: "draft" as const,
    created_at: "2024-01-02",
    updated_at: "2024-01-02",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("token", "fake-token");
  vi.mocked(api.auth.getUser).mockResolvedValue({
    id: 1,
    name: "Omar",
    email: "omar@example.com",
  });
});

describe("DashboardPage", () => {
  it("shows loading state initially", () => {
    vi.mocked(api.forms.getAll).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    expect(screen.getByText(/loading forms/i)).toBeInTheDocument();
  });

  it("renders form cards after loading", async () => {
    vi.mocked(api.forms.getAll).mockResolvedValue(mockForms);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(screen.getByText("Contact Form")).toBeInTheDocument();
      expect(screen.getByText("Survey")).toBeInTheDocument();
    });
  });

  it("shows status badges on form cards", async () => {
    vi.mocked(api.forms.getAll).mockResolvedValue(mockForms);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(screen.getByText("published")).toBeInTheDocument();
      expect(screen.getByText("draft")).toBeInTheDocument();
    });
  });

  it("shows field count on each card", async () => {
    vi.mocked(api.forms.getAll).mockResolvedValue(mockForms);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(screen.getByText("1 field")).toBeInTheDocument();
      expect(screen.getByText("0 fields")).toBeInTheDocument();
    });
  });

  it("shows empty state when no forms", async () => {
    vi.mocked(api.forms.getAll).mockResolvedValue([]);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(
        screen.getByText(/haven't created any forms/i),
      ).toBeInTheDocument();
    });
  });

  it("shows create form button", async () => {
    vi.mocked(api.forms.getAll).mockResolvedValue([]);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /create your first form/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows View link only for published forms", async () => {
    vi.mocked(api.forms.getAll).mockResolvedValue(mockForms);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      const viewLinks = screen.getAllByRole("link", { name: /view/i });
      expect(viewLinks).toHaveLength(1);
    });
  });

  it("shows user name in the header", async () => {
    vi.mocked(api.forms.getAll).mockResolvedValue([]);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(screen.getByText("Omar")).toBeInTheDocument();
    });
  });

  it("stays in loading state when API never responds", () => {
    vi.mocked(api.forms.getAll).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    expect(screen.getByText(/loading forms/i)).toBeInTheDocument();
    expect(screen.queryByText("Contact Form")).not.toBeInTheDocument();
  });

  it("does not delete form when user cancels confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(api.forms.getAll).mockResolvedValue(mockForms);
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(screen.getByText("Contact Form")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "" });
    const trashButton = deleteButtons.find((btn) =>
      btn.querySelector("svg.lucide-trash2, svg.lucide-trash-2"),
    );
    if (trashButton) await user.click(trashButton);

    expect(api.forms.remove).not.toHaveBeenCalled();
  });

  it("calls delete API when user confirms deletion", async () => {
    const user = userEvent.setup();
    vi.mocked(api.forms.getAll).mockResolvedValue(mockForms);
    vi.mocked(api.forms.remove).mockResolvedValue(undefined as never);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithProviders(<DashboardPage />, { route: "/dashboard" });

    await waitFor(() => {
      expect(screen.getByText("Contact Form")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "" });
    const trashButton = deleteButtons.find((btn) =>
      btn.querySelector("svg.lucide-trash2, svg.lucide-trash-2"),
    );
    if (trashButton) await user.click(trashButton);

    expect(api.forms.remove).toHaveBeenCalledWith("1");
  });
});
