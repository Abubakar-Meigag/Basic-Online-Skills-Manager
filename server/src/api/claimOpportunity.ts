import type { Request, Response } from "express";
import pool from "../data/connection";
import { z as zod } from "zod";

const claimCourseSchema = zod.object({
  start_date: zod
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Please provide a valid start date in YYYY-MM-DD format",
    ),
  venue_address: zod.string().trim().min(1, "Venue address is required"),
  contact_name: zod.string().trim().min(1, "Contact name is required"),
  contact_email: zod
    .string()
    .trim()
    .email("Please provide a valid contact email address"),
  lunch_arrangement: zod
    .string()
    .trim()
    .min(1, "Lunch arrangement details are required"),
  client_group_description: zod.string().trim().optional(),
  tech_level: zod.string().trim().optional(),
  goal: zod.string().trim().optional(),
  expenses_notes: zod.string().trim().optional(),
  note: zod.string().trim().optional(),
});

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

  const parseResult = claimCourseSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: parseResult.error.issues[0]?.message });
  }

  const {
    start_date,
    venue_address,
    contact_name,
    contact_email,
    client_group_description,
    tech_level,
    goal,
    lunch_arrangement,
    expenses_notes,
    note,
  } = parseResult.data;

  const parsedStartDate = new Date(start_date);
 
  const end_date = new Date(parsedStartDate);
  end_date.setDate(parsedStartDate.getDate() + 21);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Course not found" });
      return;
    }

    if (course.outreach_org_id !== null) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "Course already claimed" });
      return;
    }

    if (course.status !== "request_open") {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "Course not available to be claimed" });
      return;
    }

    await client.query(
      `UPDATE courses SET outreach_org_id = $1, 
      status = $2,
      start_date = $3,
      end_date = $4,
      venue_address = $5,
      contact_name = $6,
      contact_email = $7,
      client_group_description = $8,
      tech_level = $9,
      goal = $10,
      lunch_arrangement = $11,
      expenses_notes = $12,
      note = $13
      WHERE id = $14`,
      [
        organisationId,
        "request_claimed",
        start_date,
        end_date,
        venue_address,
        contact_name,
        contact_email,
        client_group_description,
        tech_level,
        goal,
        lunch_arrangement,
        expenses_notes,
        note,
        id,
      ],
    );

    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "course.claimed", "course", course.id],
    );

    await client.query("COMMIT");

    return res.status(201).json(course);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error claiming course: ", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export default claimOpportunity;
