import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * AUTH — enable once login is ready.
 * One detail endpoint shared by all three dashboards; role controls access.
 * Role comes from the organisation, not the user.
 * organisations.type is one of: 'cyf_staff' | 'commercial' | 'outreach'.
 *
 * Access rules:
 *   - cyf_staff   >> any course
 *   - commercial  >> only courses where commercial_org_id === their org
 *   - outreach    >> open opportunities (status request_open) OR courses they host
 */

/**
 * @swagger
 * /course-details/{id}:
 *   get:
 *     summary: Get full details for a single course (shared across all dashboards)
 *     description: >
 *       Returns the complete record for one course by id, plus resolved
 *       commercial and outreach organisation names. Used by the CYF staff
 *       Review page, commercial View Details, and outreach View Opportunity
 *       Details. Role-based access scoping will be enforced once auth is added.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the course to retrieve.
 *     responses:
 *       200:
 *         description: The full course record, wrapped in a data object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     course_name:
 *                       type: string
 *                     commercial_org_id:
 *                       type: string
 *                       format: uuid
 *                     outreach_org_id:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     account_name:
 *                       type: string
 *                     contract_name:
 *                       type: string
 *                     trainee_target:
 *                       type: integer
 *                     deadline:
 *                       type: string
 *                       format: date
 *                     city:
 *                       type: string
 *                     status:
 *                       type: string
 *                     start_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     end_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     venue_address:
 *                       type: string
 *                       nullable: true
 *                     contact_name:
 *                       type: string
 *                       nullable: true
 *                     contact_email:
 *                       type: string
 *                       nullable: true
 *                     client_group_description:
 *                       type: string
 *                       nullable: true
 *                     tech_level:
 *                       type: string
 *                       nullable: true
 *                     goal:
 *                       type: string
 *                       nullable: true
 *                     lunch_arrangement:
 *                       type: string
 *                       nullable: true
 *                     expenses_notes:
 *                       type: string
 *                       nullable: true
 *                     note:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     commercial_org:
 *                       type: string
 *                     outreach_org:
 *                       type: string
 *                       nullable: true
 *       404:
 *         description: No course found with the given id
 *       500:
 *         description: Internal server error
 */
const getCourseDetails = async (req: Request, res: Response): Promise<void> => {
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

    /**
     * todo (auth): enable role-based scoping once magic-link login is built.
     * req.user comes from session middleware and carries { organisation_id, type }.
     * this will enforced server-side from the authenticated session
     */

    // const user = (req as any).user;
    // if (!user) {
    //   res.status(401).json({ error: "Not authenticated" });
    //   return;
    // }
    //
    // if (user.type === "cyf_staff") {
    //    allowed cyf_staff can view any course
    // } else if (user.type === "commercial") {
    //   if (course.commercial_org_id !== user.organisation_id) {
    //     res.status(403).json({ error: "Forbidden" });
    //     return;
    //   }
    // } else if (user.type === "outreach") {
    //   const isOpenOpportunity = course.status === "request_open";
    //   const isMyCourse = course.outreach_org_id === user.organisation_id;
    //   if (!isOpenOpportunity && !isMyCourse) {
    //     res.status(403).json({ error: "Forbidden" });
    //     return;
    //   }
    // } else {
    //   res.status(403).json({ error: "Forbidden" });
    //   return;
    // }

    res.json({ data: course });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getCourseDetails;
