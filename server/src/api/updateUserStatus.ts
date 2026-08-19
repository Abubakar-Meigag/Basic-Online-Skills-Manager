import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Update a user's active status (CYF Staff only)
 *     description: Toggles a user between 'Active' and 'Inactive' states.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 description: The new status for the user.
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { id: targetUserId } = req.params;
  const { is_active } = req.body;

  const performerUserId = (req as any).user?.id;

  if (!performerUserId) {
    res.status(401).json({ error: "Unauthorized: No performer ID found" });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateQuery =
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id";
    const updateResult = await client.query(updateQuery, [
      is_active,
      targetUserId,
    ]);

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "User not found" });
      return;
    }

    const logQuery = `
      INSERT INTO audit_log (user_id, action, entity_type, entity_id)
      VALUES ($1, $2, $3, $4)
    `;
    const actionText = `Updated status to ${is_active ? "Active" : "Inactive"}`;

    await client.query(logQuery, [
      performerUserId,
      actionText,
      "user",
      targetUserId,
    ]);

    await client.query("COMMIT");

    res
      .status(200)
      .json({ message: "User status updated and logged successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error in updateUserStatus:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export default updateUserStatus;
