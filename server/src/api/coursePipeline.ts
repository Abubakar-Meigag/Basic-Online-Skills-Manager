import type { Request, Response } from "express";
import pool from "../data/connection";

const ACTIVE_STATUS = [
  "request_pending",
  "request_open",
  "request_claimed",
  "request_confirmed",
  "course_running",
  "course_completed",
] as const;

/**
 * AUTH — enable once login is ready.
 * CYF-staff-only endpoint: staff see ALL courses (no org scoping).
 * Role comes from the organisation, not the user.
 * organisations.type is one of: 'cyf_staff' | 'commercial' | 'outreach'.
 */

/**
 * @swagger
 * /course-pipeline:
 *   get:
 *     summary: Get all active courses grouped by status (CYF Staff dashboard)
 *     description: >
 *       Returns all courses except cancelled ones, grouped into the six active
 *       status buckets. Every status key is always present, even when empty ([]).
 *       Commercial org name is resolved via JOIN; outreach org name via LEFT JOIN
 *       (null when unassigned). CYF-staff only — no org scoping.
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Courses grouped by status (all six keys always present)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request_pending:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseSummary'
 *                 request_open:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseSummary'
 *                 request_claimed:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseSummary'
 *                 request_confirmed:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseSummary'
 *                 course_running:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseSummary'
 *                 course_completed:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseSummary'
 *       500:
 *         description: Internal server error
 */
const getCoursePipeline = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // const user = req.user;
    // if (!user || user.type !== "cyf_staff") {
    //   res.status(403).json({ error: "Forbidden" });
    //   return;
    // }

    const query = await pool.query(`
                  SELECT
                    c.id,
                    c.city,
                    c.status,
                    c.deadline,
                    c.start_date,
                    c.end_date,
                    c.created_at,
                    commercial.organisation_name AS commercial_org,
                    outreach.organisation_name   AS outreach_org
                  FROM courses c
                  JOIN organisations commercial
                    ON c.commercial_org_id = commercial.id
                  LEFT JOIN organisations outreach
                    ON c.outreach_org_id = outreach.id
                  WHERE c.status <> 'request_cancelled'
                  ORDER BY c.start_date ASC NULLS LAST
            `);

    /**
     * Maps each course status to an array of its courses.
     * Every status in ACTIVE_STATUS is seeded with an empty array first,
     * so statuses with no courses still appear in the response as [] rather
     * than being omitted - letting the frontend render all sections consistently.
     */
    const courses: Record<string, unknown[]> = {};
    for (const status of ACTIVE_STATUS) {
      courses[status] = [];
    }

    for (const row of query.rows) {
      /**
       * Look up the pre-seeded array for this row's status, then push the row into it.
       * Stored in a variable first so TypeScript can confirm it's defined (not undefined)
       * before calling .push a direct courses[row.status].push() would trigger
       * a "possibly undefined" error under strict index checking.
       */
      const statusGroup = courses[row.status];
      if (statusGroup) {
        statusGroup.push(row);
      } else {
        console.warn(
          `Unexpected course status "${row.status}" found in database for course ID ${row.id}`,
        );
      }
    }

    res.json(courses);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getCoursePipeline;
