import type { Request, Response } from "express";
import pool from "../data/connection";
import { ORGANISATION_TYPE, PARTNER_TYPES } from ".././constants/organisations";

const DOMAIN_REGEX =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * @swagger
 * /addPartner:
 *   post:
 *     summary: Create a new organisation (Only allow CYF Staff)
 *     description: >
 *       Creates a new organisation of any type (cyf_staff, commercial, or
 *       outreach). This endpoint only creates the organisation — users are
 *       added separately via the add-user endpoint.
 *       CYF-staff only (enforced by authorizeRole middleware).
 *     tags: [Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organisation_name, type, email_domain, city]
 *             properties:
 *               organisation_name:
 *                 type: string
 *                 example: Deloitte
 *               type:
 *                 type: string
 *                 enum: [cyf_staff, commercial, outreach]
 *                 example: commercial
 *               email_domain:
 *                 type: string
 *                 example: deloitte.com
 *               city:
 *                 type: string
 *                 example: London
 *     responses:
 *       201:
 *         description: Organisation created
 *       400:
 *         description: Missing required fields or invalid type
 *       409:
 *         description: An organisation with this name or email domain already exists
 *       500:
 *         description: Internal server error
 */
const addPartner = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { organisation_name, type, email_domain, city } = req.body;

  // Validation
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  if (!organisation_name || !type || !email_domain || !city) {
    res.status(400).json({
      error: "organisation_name, type, email_domain, and city are all required",
    });
    return;
  }

  if (!(PARTNER_TYPES as readonly ORGANISATION_TYPE[]).includes(type)) {
    res.status(400).json({
      error: `type must be one of: ${PARTNER_TYPES.join(", ")}`,
    });
    return;
  }

  if (!DOMAIN_REGEX.test(email_domain)) {
    res.status(400).json({
      error:
        "email_domain must be a bare domain like 'company.com' (no '@', 'http://', or trailing slash)",
    });
    return;
  }

  const normalisedDomain = email_domain.toLowerCase();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Reject if an org with this name or email_domain already exists.
    const existingOrg = await client.query(
      `SELECT id FROM organisations
       WHERE organisation_name = $1 OR email_domain = $2`,
      [organisation_name, normalisedDomain],
    );

    if (existingOrg.rows.length > 0) {
      await client.query("ROLLBACK");
      res.status(409).json({
        error: "An organisation with this name or email domain already exists.",
      });
      return;
    }

    const result = await client.query(
      `INSERT INTO organisations (organisation_name, type, email_domain, city)
       VALUES ($1, $2, $3, $4)
       RETURNING id, organisation_name, type, email_domain, city, created_at`,
      [organisation_name, type, normalisedDomain, city],
    );

    const newOrg = result.rows[0];

    // Audit log record who created this organisation
    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "create_organisation", "organisation", newOrg.id],
    );

    await client.query("COMMIT");

    res.status(201).json({ organisation: newOrg });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error creating organisation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export default addPartner;
