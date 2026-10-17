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
});
