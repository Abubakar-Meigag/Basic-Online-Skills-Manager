import request from "supertest";
import app from "../app";
import pool from "../data/connection";

vi.mock("../data/connection", () => ({
  default: { connect: vi.fn() },
}));

const makeClient = () => ({
  query: vi.fn(),
  release: vi.fn(),
});

describe("POST /course/:id/claim", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should claim the course opportunity", () => {
    
  });
});
