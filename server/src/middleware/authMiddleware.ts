import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../auth/auth.service"; 

// We extend the standard Express Request to include our user payload.
interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

const jwtSecret = process.env.JWT_SECRET;