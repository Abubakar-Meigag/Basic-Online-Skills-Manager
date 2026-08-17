import { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /outreach/courses:
 *   get:
 *     summary: Get all hosted courses for the logged-in outreach partner
 *     tags: [Outreach]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of hosted courses retrieved successfully
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - user is not an outreach partner
 *       500:
 *         description: Internal server error
 */

const getOutreachCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = (req as any).user;

    const query = `
    SELECT 
    c.id,
  c.course_name,
  o.organisation_name AS partner_organisation,
  c.trainee_target,
  c.venue_address AS venue,
  c.start_date,
  c.end_date,
  c.status
FROM courses c
LEFT JOIN organisations o ON c.commercial_org_id = o.id
WHERE c.outreach_org_id = $1
ORDER BY c.start_date ASC NULLS LAST`;
    // Send array of rows back to the client
    const result = await pool.query(query, [user.organisationId]);

    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getOutreachCourse;
