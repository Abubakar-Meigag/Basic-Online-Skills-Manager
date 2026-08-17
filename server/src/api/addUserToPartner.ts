import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /partners/{id}/users:
 *   post:
 *     summary: Add a login user to an existing partner organisation (CYF Staff)
 *     description: >
 *       Creates a new login user attached to the existing organisation identified
 *       by the path id. The organisation must exist (404 otherwise). The user's
 *       organisation_id is taken from the path, never the body. Rejects a
 *       duplicate email with 409. Writes a user.created audit_log entry.
 *       CYF-staff only (guard pending auth).
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the organisation to attach the user to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: second.user@capgemini.com
 *     responses:
 *       201:
 *         description: User created and linked to the organisation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing or malformed email
 *       404:
 *         description: No organisation found with the given id
 *       409:
 *         description: A user with this email already exists
 *       500:
 *         description: Internal server error
 */
const addUserToPartner = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { id } = req.params;
  const { email } = req.body;

  // Validation
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  // Basic email format check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    res.status(400).json({ error: "email is malformed" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Organisation must exist before we create a user for it
    const org = await client.query(
      `SELECT id FROM organisations WHERE id = $1`,
      [id],
    );
    if (org.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Organisation not found" });
      return;
    }

    // Reject if this email is already taken
    const existingUser = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );
    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }

    // Insert the user, linked to the org from the PATH (never the body)
    const userResult = await client.query(
      `INSERT INTO users (email, organisation_id)
       VALUES ($1, $2)
       RETURNING id, email, organisation_id`,
      [email, id],
    );
    const newUser = userResult.rows[0];

    // Audit: record that a user was created
    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "user.created", "user", newUser.id],
    );

    await client.query("COMMIT");

    res.status(201).json(newUser);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error adding user to partner:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export default addUserToPartner;
