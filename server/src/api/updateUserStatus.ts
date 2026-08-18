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
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id",
      [is_active, id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default updateUserStatus;
