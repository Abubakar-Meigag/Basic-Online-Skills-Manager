import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /organisations:
 *   get:
 *     summary: List all organisations (dropdown source for Add User form, CYF Staff)
 *     description: >
 *       Returns a flat array of organisations, each with id, organisation_name
 *       and type — enough to populate and label the Add User dropdown. Ordered
 *       by organisation_name for a stable, scannable list. CYF-staff only
 *       (guard pending auth).
 *     tags: [Partners]
 *     responses:
 *       200:
 *         description: A flat array of organisations
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
 *                   organisation_name:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [cyf_staff, commercial, outreach]
 *       500:
 *         description: Internal server error
 */
const getOrganisations = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = await pool.query(
      `SELECT id, organisation_name, type, city, email_domain
       FROM organisations
       ORDER BY organisation_name ASC`,
    );

    res.json(query.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getOrganisations;
