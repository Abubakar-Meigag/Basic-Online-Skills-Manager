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

    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

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

      req.user = decoded;

      if (req.user.orgType !== requiredRole) {
        return res.status(403).json({
          message: "Access Denied: Redirecting to your dashboard.",
          redirectRoute: "/",
        });
      }

      const userResult = await pool.query(
        "SELECT id, is_active FROM users WHERE id = $1",
        [decoded.id],
      );

      const dbUser = userResult.rows[0];

      if (!dbUser || !dbUser.is_active) {
        return res.status(401).json({
          message: "User account is inactive or disabled.",
          redirectRoute: "/login",
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
