import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../auth/auth.service";
import pool from "../data/connection";

interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authorizeRole = (requiredRole: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const jwtSecret = process.env.JWT_SECRET as string;

    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. No token found.",
        redirectRoute: "/login",
      });
    }

    try {
      if (!jwtSecret) {
        throw new Error("JWT_SECRET is missing from server environment.");
      }

      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ["HS256"],
      }) as unknown as UserPayload;

      const userResult = await pool.query(
        `SELECT 
           u.id, 
           u.email,
           u.is_active, 
           org.type AS org_type, 
           org.id AS organisation_id
         FROM users u
         LEFT JOIN organisations org ON u.organisation_id = org.id
         WHERE u.id = $1`,
        [decoded.id],
      );

      const dbUser = userResult.rows[0];

      if (!dbUser || !dbUser.is_active) {
        return res.status(401).json({
          message: "User account is inactive or disabled.",
          redirectRoute: "/login",
        });
      }

      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        orgType: dbUser.org_type,
        organisationId: dbUser.organisation_id,
      };

      if (req.user.orgType !== requiredRole) {
        return res.status(403).json({
          message: "Access Denied: Redirecting to your dashboard.",
          redirectRoute: "/",
        });
      }

      next();
    } catch (error: any) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return res.status(401).json({
          message: "Your session is invalid or expired. Please log in again.",
          redirectRoute: "/login",
        });
      }

      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return;
  };
};
