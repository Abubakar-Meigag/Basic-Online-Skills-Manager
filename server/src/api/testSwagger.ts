import type { Request, Response } from "express";

// Don't use or change this file it's just a placeholder for Swagger UI documentation purposes.

/**
 * keep in mind you need to add the following comment block
 * above your endpoint handler function to make it appear in Swagger UI
 * with the correct request and response schema.
 * The example below is for a POST endpoint that creates a new course request.
 * @swagger
 * /api/testSwagger:
 *   post:
 *     summary: Submit a new course request (Commercial partner)
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_name:
 *                 type: string
 *               contract_name:
 *                 type: string
 *               city:
 *                 type: string
 *               trainee_target:
 *                 type: integer
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Course request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 */
export default function testSwagger(req: Request, res: Response) {
  // TODO: actual DB insert logic goes here later
  res.status(201).json({ message: "Course request received (placeholder)" });
}
