import type { Request, Response } from "express";
import pool from "../data/connection";


const ALLOWED_STATUSES = [
  "request_open", 
  "request_confirmed", 
  "course_running", 
  "course_completed",
];

/**
 * @swagger
 * /course/{id}/status:
 *   patch:
 *     summary: Change a course's status (CYF Staff)
 *     description: >
 *       Moves a course through its lifecycle from the Request Pipeline / Review
 *       page action buttons: Publish to Outreach (request_open), Confirm
 *       Partnership (request_confirmed), Mark as Running (course_running), Mark
 *       as Completed (course_completed). Updates courses.status only — no dates
 *       or other fields — and writes an audit_log entry for every change.
 *       CYF-staff only.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the course to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [request_open, request_confirmed, course_running, course_completed]
 *                 example: request_open
 *     responses:
 *       200:
 *         description: Course status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Missing status, or status not an allowed CYF transition
 *       403:
 *         description: Caller is not CYF staff
 *       404:
 *         description: No course found with the given id
 *       500:
 *         description: Internal server error
 */
const updateCourseStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Access control: CYF staff only
  const user = (req as any).user;
  if (!user || user.orgType !== "cyf_staff") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { id } = req.params;
  const { status } = req.body;


  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    res.status(400).json({
      error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
    });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");


    const existing = await client.query(
      `SELECT id FROM courses WHERE id = $1`,
      [id],
    );
    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const result = await client.query(
      `UPDATE courses
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );
    const course = result.rows[0];

    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "course.status_changed", "course", course.id],
    );

    await client.query("COMMIT");
    res.status(200).json(course);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error updating course status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export default updateCourseStatus;
