import type { Request, Response } from "express";
import pool from "../data/connection";


/**
 * TODO(auth): uncomment once magic-link login is built req.user comes from session middleware.
 * req.user is populated by auth middleware after magic-link verification.
 * Note - wire to real session once auth is built.
*/

/**
 * @swagger
 * /opportunities:
 *   get:
 *     summary: Get all open course opportunities (Outreach dashboard)
 *     description: >
 *       Returns all courses with status request_open that outreach partners
 *       can claim, as a flat array. The commercial partner's organisation name
 *       is resolved via a join.
 *     tags: [Opportunities]
 *     responses:
 *       200:
 *         description: A flat array of open opportunities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   city:
 *                     type: string
 *                   trainee_target:
 *                     type: integer
 *                   deadline:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 *                     example: request_open
 *                   commercial_org:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
const getAvailableOpportunities = async (req: Request, res: Response): Promise<void> => {
  try {

//     const user = (req as any).user;

//     if (!user) {
//       res.status(401).json({ error: "Not authenticated" });
//       return;
//     }

//     if (user.organisation_type !== "outreach") {
//       res
//         .status(403)
//         .json({ error: "Only outreach partners can view opportunities" });
//       return;
//     }

    const query = await pool.query(`
      SELECT
        c.id,
        c.city,
        c.trainee_target,
        c.start_date,
        c.end_date,
        c.deadline,
        commercial.organisation_name AS commercial_org
      FROM courses c
      JOIN organisations commercial
        ON c.commercial_org_id = commercial.id
      WHERE c.status = 'request_open'
      ORDER BY c.deadline ASC
    `);

    res.json(query.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getAvailableOpportunities;
