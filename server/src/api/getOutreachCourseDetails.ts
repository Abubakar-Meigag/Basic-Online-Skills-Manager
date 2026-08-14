import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /course-details/outreach/{id}:
 *   get:
 *     summary: Get full course details (Outreach partner)
 *     description: >
 *       Returns the full details of a single course, but only if it is an open
 *       opportunity (status request_open) OR a course hosted by the requesting
 *       outreach partner's own organisation. Returns 403 otherwise.
 *       Outreach-partner only (enforced by authorizeRole middleware).
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: The course details
 *       403:
 *         description: Not an open opportunity and not hosted by this organisation
 *       404:
 *         description: No course found with the given id
 *       500:
 *         description: Internal server error
 */
const getOutreachCourseDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const query = await pool.query(
      `SELECT
         c.*,
         commercial.organisation_name AS commercial_org,
         outreach.organisation_name   AS outreach_org
       FROM courses c
       JOIN organisations commercial
         ON c.commercial_org_id = commercial.id
       LEFT JOIN organisations outreach
         ON c.outreach_org_id = outreach.id
       WHERE c.id = $1`,
      [id],
    );

    const course = query.rows[0];
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Access: an open opportunity anyone can view, OR a course this org hosts.
    const isOpenOpportunity = course.status === "request_open";
    const isMyCourse = course.outreach_org_id === user.organisationId;

    if (!isOpenOpportunity && !isMyCourse) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json({ data: course });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getOutreachCourseDetails;
