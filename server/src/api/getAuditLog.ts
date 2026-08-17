import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /audit-log:
 *   get:
 *     summary: Get all audit log entries system-wide (CYF Staff)
 *     description: >
 *       Returns every audit_log entry across the system, newest first. Each entry
 *       resolves the acting user's email by joining audit_log.user_id to users.
 *       CYF-staff only (enforced by authorizeRole middleware). Pagination is not
 *       yet implemented and is a likely follow-up as the log grows.
 *     tags: [Audit Log]
 *     responses:
 *       200:
 *         description: A flat array of audit entries, ordered by created_at DESC
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
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                   user_email:
 *                     type: string
 *                     format: email
 *                   action:
 *                     type: string
 *                     example: user.created
 *                   entity_type:
 *                     type: string
 *                     example: user
 *                   entity_id:
 *                     type: string
 *                     format: uuid
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Caller is not CYF staff
 *       500:
 *         description: Internal server error
 */
const getAuditLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = await pool.query(
      `SELECT
         al.id,
         al.user_id,
         u.email AS user_email,
         al.action,
         al.entity_type,
         al.entity_id,
         al.created_at
       FROM audit_log al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC`,
    );

    res.status(200).json(query.rows);
  } catch (error) {
    console.error("Database error fetching audit log:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getAuditLog;
