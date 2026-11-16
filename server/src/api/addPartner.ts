import type { Request, Response } from "express";
import pool from "../data/connection";
import { ORGANISATION_TYPE } from "../constants/organisations";
import { DatabaseError } from "pg";
import { PG_UNIQUE_VIOLATION } from "@drdgvhbh/postgres-error-codes";
import { z as zod } from "zod";

const addPartnerSchema = zod.object({
  organisation_name: zod
    .string()
    .trim()
    .min(1, "Organisation name is required"),
  type: zod.nativeEnum(ORGANISATION_TYPE, {
    message: "Please select a valid organisation type",
  }),
  email_domain: zod
    .string()
    .trim()
    .regex(
      /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
      "Please enter a valid bare domain like 'company.com' (no '@' or 'http://')",
    ),
  city: zod.string().trim().min(1, "City is required"),
});

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

  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const parseResult = addPartnerSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.issues[0]?.message });
    return;
  }

  const { organisation_name, type, email_domain, city } = parseResult.data;

  const normalisedDomain = email_domain.toLowerCase();
  const normalisedOrganisationName = organisation_name.trim().toLowerCase();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO organisations (organisation_name, type, email_domain, city)
       VALUES ($1, $2, $3, $4)
       RETURNING id, organisation_name, type, email_domain, city, created_at`,
      [normalisedOrganisationName, type, normalisedDomain, city],
    );

    const newOrg = result.rows[0];

    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "create_organisation", "organisation", newOrg.id],
    );

    await client.query("COMMIT");

    res.status(201).json({ organisation: newOrg });
  } catch (error: unknown) {
    await client.query("ROLLBACK");

    // Handle unique constraint violation for organisation_name or email_domain
    if (error instanceof DatabaseError && error.code === PG_UNIQUE_VIOLATION) {
      res.status(409).json({
        error: "An organisation with this name or email domain already exists.",
      });
      return;
    }

    console.error("Database error creating organisation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export default addPartner;
