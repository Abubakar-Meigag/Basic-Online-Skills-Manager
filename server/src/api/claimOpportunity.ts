import type { Request, Response } from "express";
import pool from "../data/connection";

/**
 * @swagger
 * /course/{id}/claim:
 *   post:
 *     summary: Outreach Partner claims a course
 *     description: Attaches the Outreach Partner to the course.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the organisation to attach the course to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [start_date, venue_address, contact_name, contact_email, client_group_description, tech_level, goal, lunch_arrangement, expenses_notes]
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *               venue_address:
 *                 type: string
 *               contact_name:
 *                 type: string
 *                 example: John Doe
 *               contact_email:
 *                 type: string
 *                 format: email
 *                 example: outreach@dwp.co.uk
 *               client_group_description:
 *                 type: string
 *               tech_level:
 *                 type: string
 *               goal:
 *                 type: string
 *               lunch_arrangement:
 *                 type: string
 *               expenses_notes:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Outreach Partner has claimed the opportunity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       403:
 *         description: Unauthorized User
 *       400:
 *         description: Course not found
 *       409:
 *         description: Course already claimed
 *       500:
 *         description: Internal server error
 */
