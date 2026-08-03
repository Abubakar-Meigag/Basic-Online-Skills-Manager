import { Request, Response } from "express";
import pool from "../data/connection";

/**
 * AUTH - enable once login is ready.
 * Flow: magic-link login verifies the user, then the session carries { user_id, organisation_id, type }.
 * Role comes from the organisation, not the user.
 * organisations.type is one of: 'cyf_staff' | 'commercial' | 'outreach'.
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

    const result = await pool.query(
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

    return res.json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching commercial partner courses:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default getCommercialDashboard;
