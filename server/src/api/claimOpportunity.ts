import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /course/{id}/claim:
 *   post:
 *     summary: Outreach Partner claims a course
 *     description: Attaches the Outreach Partner to the course.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the organisation to attach the course to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [start_date, venue_address, contact_name, contact_email, client_group_description, tech_level, goal, lunch_arrangement, expenses_notes]
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *               venue_address:
 *                 type: string
 *               contact_name:
 *                 type: string
 *                 example: John Doe
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 example: outreach@dwp.co.uk
 *               client_group_description:
 *                 type: string
 *               tech_level:
 *                 type: string
 *               goal:
 *                 type: string
 *               lunch_arrangement:
 *                 type: string
 *               expenses_notes:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Outreach Partner has claimed the opportunity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Organisation name is required
 *       403:
 *         description: Unauthorized User
 *       404:
 *         description: Course not found
 *       409:
 *         description: Course already claimed
 *       500:
 *         description: Internal server error
 */
const claimOpportunity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || user.orgType !== "outreach") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const organisationId = user.organisationId;

    if (!organisationId) {
      return res.status(400).json({
        error: "organisationId query param is required",
      });
    }

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

    if (course.outreach_org_id !== null) {
      res.status(409).json({ error: "Course already claimed" });
      return;
    }

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "course.claimed", "course", course.id],
    );

    return res.status(201).json(course);
  } catch (err) {
    console.error("Error claiming course: ", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default claimOpportunity;
