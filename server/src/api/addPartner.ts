import type { Request, Response } from "express";
import pool from "../data/connection";
import { PARTNER_TYPES } from "../constants/organisationTypes";

/**
 * AUTH — enable once login is ready.
 * CYF-staff-only endpoint: onboards a new partner organisation + its first user.
 * Role comes from the organisation, not the user.
 * organisations.type is one of: 'cyf_staff' | 'commercial' | 'outreach'.
 */

/**
 * @swagger
 * /addPartner:
 *   post:
 *     summary: Onboard a new partner organisation and its first user (CYF Staff)
 *     description: >
 *       Creates a new partner organisation and its first login user together
 *       in a single transaction (all-or-nothing). Type must be 'commercial' or
 *       'outreach' — 'cyf_staff' cannot be created here. Rejects duplicate
 *       organisation name/email_domain and duplicate email with 409.
 *       CYF-staff only (guard pending auth).
 *     tags: [Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organisation_name, type, email_domain, email]
 *             properties:
 *               organisation_name:
 *                 type: string
 *                 example: Deloitte
 *               type:
 *                 type: string
 *                 enum: [commercial, outreach]
 *                 example: commercial
 *               email_domain:
 *                 type: string
 *                 example: deloitte.com
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@deloitte.com
 *     responses:
 *       201:
 *         description: Partner organisation and first user created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organisation:
 *                   $ref: '#/components/schemas/Organisation'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields or invalid type
 *       409:
 *         description: Organisation name/email_domain or email already exists
 *       500:
 *         description: Internal server error
 */
const addPartner = async (req: Request, res: Response): Promise<void> => {
  // todo(auth): enable once magic-link login is built.
  // const user = (req as any).user;
  // if (!user || user.type !== "cyf_staff") {
  //   res.status(403).json({ error: "Forbidden" });
  //   return;
  // }

  const { organisation_name, type, email_domain, email } = req.body;

  if (!organisation_name || !type || !email_domain || !email) {
    res.status(400).json({
      error:
        "organisation_name, type, email_domain, and email are all required",
    });
    return;
  }

  if (!PARTNER_TYPES.includes(type)) {
    res.status(400).json({
      error: `type must be one of: ${PARTNER_TYPES.join(", ")}`,
    });
    return;
  }

  // create org + first user together
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // reject if an org with this name or email_domain already exists
    const existingOrg = await client.query(
      `SELECT id FROM organisations
       WHERE organisation_name = $1 OR email_domain = $2`,
      [organisation_name, email_domain],
    );
    if (existingOrg.rows.length > 0) {
      await client.query("ROLLBACK");
      res.status(409).json({
        error:
          "An organisation with this name or email domain already exists. To add a user to an existing partner, use add user option.",
      });
      return;
    }

    // reject if this email is already taken
    const existingUser = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );
    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }

    // insert the organisation
    const orgResult = await client.query(
      `INSERT INTO organisations (organisation_name, type, email_domain)
       VALUES ($1, $2, $3)
       RETURNING id, organisation_name, type, email_domain, created_at`,
      [organisation_name, type, email_domain],
    );
    const organisation = orgResult.rows[0];

    // insert the first user, linked to the new org
    const userResult = await client.query(
      `INSERT INTO users (email, organisation_id)
       VALUES ($1, $2)
       RETURNING id, email, organisation_id`,
      [email, organisation.id],
    );
    const newUser = userResult.rows[0];

    await client.query("COMMIT");

    res.status(201).json({
      organisation,
      user: newUser,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error creating partner:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export default addPartner;
