import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /course-details/staff/{id}:
 *   get:
 *     summary: Get full course details (CYF Staff)
 *     description: >
 *       Returns the full details of a single course. CYF staff can view any
 *       course, so there is no per-record ownership restriction here.
 *       CYF-staff only (enforced by authorizeRole middleware).
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
 *       404:
 *         description: No course found with the given id
 *       500:
 *         description: Internal server error
 */
const getStaffCourseDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
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

    // Staff can view any course — no ownership check.
    res.json({ data: course });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getStaffCourseDetails;