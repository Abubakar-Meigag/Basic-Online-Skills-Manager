import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /commercial/requestedNewCourses:
 *   post:
 *     summary: Create a new course request (Commercial partner)
 *     description: >
 *       Creates a new course in status request_pending from the commercial
 *       dashboard's "Request New Course" form. commercial_org_id comes from the
 *       authenticated session, never the body, and status is forced to
 *       request_pending server-side. The new course then appears in both the
 *       partner's own dashboard and the CYF staff pipeline automatically.
 *       Commercial-partner only.
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [account_name, contract_name, city, trainee_target, deadline]
 *             properties:
 *               account_name:
 *                 type: string
 *                 example: National Highways
 *               contract_name:
 *                 type: string
 *                 example: DWS
 *               city:
 *                 type: string
 *                 example: Birmingham
 *               trainee_target:
 *                 type: integer
 *                 example: 12
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-30
 *     responses:
 *       201:
 *         description: Course request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Missing required fields, invalid trainee_target, or invalid deadline
 *       403:
 *         description: Caller is not a commercial partner, or not linked to an organisation
 *       500:
 *         description: Internal server error
 */
const requestNewCourse = async (req: Request, res: Response): Promise<void> => {
  // checking auth
  const user = (req as any).user;

  const commercial_org_id = user.organisationId;

  if (!commercial_org_id) {
    res.status(403).json({ error: "User is not linked to an organisation" });
    return;
  }

  const { account_name, contract_name, city, trainee_target, deadline } =
    req.body;

  if (
    !account_name ||
    !contract_name ||
    !city ||
    trainee_target === undefined ||
    !deadline
  ) {
    res.status(400).json({
      error:
        "account_name, contract_name, city, trainee_target, and deadline are all required",
    });
    return;
  }

  if (!Number.isInteger(trainee_target) || trainee_target <= 0) {
    res.status(400).json({
      error: "trainee_target must be a positive integer",
    });
    return;
  }

  // Validate deadline is a real YYYY-MM-DD date.
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(deadline)) {
    res.status(400).json({
      error: "deadline must be in YYYY-MM-DD format",
    });
    return;
  }

  const parsedDeadline = new Date(deadline);
  if (
    isNaN(parsedDeadline.getTime()) ||
    parsedDeadline.toISOString().slice(0, 10) !== deadline
  ) {
    res.status(400).json({
      error: "deadline is not a valid calendar date",
    });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // status is forced to request_pending.
    const result = await client.query(
      `INSERT INTO courses
        (commercial_org_id, account_name, contract_name, city, trainee_target, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'request_pending')
       RETURNING *`,
      [
        commercial_org_id,
        account_name,
        contract_name,
        city,
        trainee_target,
        deadline,
      ],
    );
    const course = result.rows[0];

    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "course_request.created", "course", course.id],
    );

    await client.query("COMMIT");
    res.status(201).json(course);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error creating course request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export default requestNewCourse;
