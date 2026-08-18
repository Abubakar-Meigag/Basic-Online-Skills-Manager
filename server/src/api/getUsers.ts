import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all registered users (CYF Staff only)
 *     description: >
 *       Returns an array of users joined with their organisation name.
 *       Includes ID, email, organisation name, and active status.
 *       Ordered by organisation_name for scannability.
 *     tags: [Partners]
 *     responses:
 *       200:
 *         description: A flat array of users with joined organisation data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   email:
 *                     type: string
 *                   organisation_name:
 *                     type: string
 *                     nullable: true
 *                   is_active:
 *                     type: boolean
 *                   last_login_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *       500:
 *         description: Internal server error
 */
const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    // We use a LEFT JOIN so that users without an organisation
    // are still included in the list.
    const query = await pool.query(
      `SELECT 
        u.id, 
        u.email, 
        o.organisation_name, 
        u.is_active, 
        u.last_login_at
       FROM users u
       LEFT JOIN organisations o ON u.organisation_id = o.id
       ORDER BY organisation_name ASC`,
    );

    res.status(200).json(query.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getUsers;
