import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /commercial/requestedNewCourses:
 *   post:
 *     summary: Create a new course request (Commercial partner)
 *     description: >
 *       Creates a new course in status request_pending from the commercial
 *       dashboard's "Request New Course" form. Temporarily, the caller supplies
 *       commercial_org_id (query param or body) until auth is built — it will
 *       come from the session in production. status is forced to request_pending
 *       server-side. The new course then appears in both the partner's own
 *       dashboard and the CYF staff pipeline automatically. Commercial-partner
 *       only (guard pending auth).
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
 *         description: Missing required fields or invalid trainee_target
 *       500:
 *         description: Internal server error
 */
const requestNewCourse = async (req: Request, res: Response): Promise<void> => {
  // todo(auth): enable once magic-link login is built.
  // const user = (req as any).user;
  // if (!user || user.type !== "commercial") {
  //   res.status(403).json({ error: "Forbidden" });
  //   return;
  // }

  // todo(auth): replace the block below with
  // const commercial_org_id = user.organisation_id;
  const commercial_org_id =
    req.query.commercial_org_id ?? req.body.commercial_org_id;

  if (!commercial_org_id) {
    res.status(400).json({
      error:
        "commercial_org_id is required (temporary — will come from the session once auth is built)",
    });
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

  try {
    // status is forced to request_pending.
    const result = await pool.query(
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

    // todo(auth): re-enable once login exists — audit_log.user_id is NOT NULL,
    // so this needs the authenticated user's id to record who created the request.
    // await pool.query(
    //   `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
    //    VALUES ($1, $2, $3, $4)`,
    //   [user.id, "course_request.created", "course", course.id],
    // );

    res.status(201).json(course);
  } catch (error) {
    console.error("Database error creating course request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default requestNewCourse;
