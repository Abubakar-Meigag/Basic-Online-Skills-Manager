import { Request, Response } from "express";
import pool from "../data/connection";

/**
 * AUTH - enable once login is ready.
 * Flow: magic-link login verifies the user, then the session carries { user_id, organisation_id, type }.
 * Role comes from the organisation, not the user.
 * organisations.type is one of: 'cyf_staff' | 'commercial' | 'outreach'.
 */

/**
 * @swagger
 * /commercial/courses:
 *   get:
 *     summary: Get the logged-in commercial partner's courses (Commercial dashboard)
 *     description: >
 *       Returns all courses belonging to a commercial partner's organisation,
 *       across all statuses, as a flat array under a "data" key. The outreach
 *       partner's name is resolved via a LEFT JOIN (null when unassigned).
 *       NOTE: organisationId is temporarily read from a query param until auth
 *       is connected; it will later come from the session.
 *     tags: [Commercial]
 *     parameters:
 *       - in: query
 *         name: organisationId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: >
 *           TEMPORARY — the commercial organisation's UUID. Defaults to a test
 *           org if omitted. Will be replaced by the authenticated session.
 *     responses:
 *       200:
 *         description: The partner's courses, wrapped in a data array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       course_name:
 *                         type: string
 *                       account_name:
 *                         type: string
 *                       contract_name:
 *                         type: string
 *                       trainee_target:
 *                         type: integer
 *                       deadline:
 *                         type: string
 *                         format: date
 *                       city:
 *                         type: string
 *                       status:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                       end_date:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                       outreach_partner:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: organisationId missing (temporary, until auth is ready)
 *       500:
 *         description: Internal server error
 */
const getCommercialDashboard = async (req: Request, res: Response) => {
  try {
    // const user = req.user;
    // if (!user || user.type !== "commercial") {
    //   return res.status(403).json({ error: "Forbidden" });
    // }
    // const organisationId = user.organisationId;

    /**
     * TEMPORARY: until auth is connected, take org id from the query
     */
    const organisationId =
      (req.query.organisationId as string) ||
      "60ea2b0f-e04e-4f9a-ac72-38bae06d98bc";

    if (!organisationId) {
      return res.status(400).json({
        error:
          "organisationId query param is required (temporary until auth is ready)",
      });
    }

    const commercialTableData = await pool.query(
      `SELECT
            c.id,
            c.course_name,
            c.account_name,
            c.contract_name,
            c.trainee_target,
            c.deadline,
            c.city,
            c.status,
            c.start_date,
            c.end_date,
            o.organisation_name AS outreach_partner
      FROM courses c
            LEFT JOIN organisations o ON o.id = c.outreach_org_id
      WHERE c.commercial_org_id = $1
      ORDER BY c.deadline DESC`,
      [organisationId],
    );

    return res.json({ data: commercialTableData.rows });
  } catch (err) {
    console.error("Error fetching commercial partner courses:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default getCommercialDashboard;
