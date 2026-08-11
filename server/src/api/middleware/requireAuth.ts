import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Verifies the JWT issued at login (auth.service >> verifyMagicLinkToken) and
// puts its payload on req.user: { id, email, orgType, organisationId }.
// Apply this to any route that needs an authenticated user.
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: "JWT_SECRET is not configured" });
    console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "yes" : "NO");
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
