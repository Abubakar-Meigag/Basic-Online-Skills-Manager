import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../auth/auth.service";

// Extend the standard Express Request to include our user payload.
interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const jwtSecret = process.env.JWT_SECRET as string;

    // Finding the Key Card
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required. No token found.",
        redirectTo: "/login",
      });
    }

    // Get the token
    const token = authHeader as string;

    // Verify the card's signature against the JWT_SECRET and algorithm.
    try {
      if (!jwtSecret) {
        throw new Error("JWT_SECRET is missing from server environment.");
      }

      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ["HS256"],
      }) as unknown as UserPayload;

      // Store the decoded user data in the request
      req.user = decoded;

      // ROLE CHECK
      if (req.user.orgType !== requiredRole) {
        return res.status(403).json({
          message: "Access Denied: Redirecting to your dashboard.",
          redirectTo: "/", // This tells the frontend where to go
        });
      }

      // This tells Express to move to the next function.
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Your session is invalid or expired. Please log in again.",
        redirectTo: "/login", // Tell the frontend to send them to the sign-in door
      });
    }
  };
};
