import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OutreachDashboard from "./OutreachDashboard";
import { api } from "../../auth/authApi";

vi.mock("../../auth/authApi", () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockCourses = [
  {
    id: "course-abcde-12345",
    city: "Birmingham",
    trainee_target: 15,
    status: "request_open",
    deadline: "2026-11-20",
    commercial_org: "Capgemini",
  },
];

describe("OutreachDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table headers and does not display the Commercial Partner column", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(<OutreachDashboard />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/opportunities");
    });

    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Trainee Target")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("Deadline")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();

    expect(screen.queryByText("Commercial Partner")).not.toBeInTheDocument();
  });

  it("renders course data rows returned by the API", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockCourses });

    render(<OutreachDashboard />);

    expect(await screen.findByText("Birmingham")).toBeInTheDocument();
    expect(screen.getByText("3 Weeks")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /view details/i }),
    ).toBeInTheDocument();
  });

  it("switches to the Claim Opportunity view when 'View Details' is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValue({ data: mockCourses });

    render(<OutreachDashboard />);

    const viewDetailsButton = await screen.findByRole("button", {
      name: /view details/i,
    });

    await user.click(viewDetailsButton);

    expect(
      await screen.findByRole("heading", { name: /claim this opportunity/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Capgemini")).toBeInTheDocument();
  });

  it("handles network failure gracefully when fetching opportunities fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValueOnce(new Error("Network Error"));

    render(<OutreachDashboard />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    expect(screen.getByText("Location")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("navigates back to the table when clicking the '← Opportunity Board' back button", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValue({ data: mockCourses });

    render(<OutreachDashboard />);

    const viewDetailsButton = await screen.findByRole("button", {
      name: /view details/i,
    });
    await user.click(viewDetailsButton);
    expect(
      await screen.findByRole("heading", { name: /claim this opportunity/i }),
    ).toBeInTheDocument();

    const backButton = screen.getByRole("button", {
      name: /opportunity board/i,
    });
    await user.click(backButton);

    expect(
      await screen.findByText("Available Opportunities"),
    ).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
  });
});
