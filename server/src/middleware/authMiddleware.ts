import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../auth/auth.service";

// We extend the standard Express Request to include our user payload.
interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

const jwtSecret = process.env.JWT_SECRET;

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Finding the Key Card
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. No token found.",
      });
    }

    // Get the token part after "Bearer "
    const token = authHeader.split(" ")[1];
  };
};
