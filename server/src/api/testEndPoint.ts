import type { Request, Response } from "express";
import pool from "../data/connection";

const testEndPoint = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC",
    );

    if (query.rows.length === 0) {
      res.json({ message: "No users found" });
      return;
    }

    res.json(query.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default testEndPoint;
