import crypto from "node:crypto";
import pool from "../data/connection";
import jwt from "jsonwebtoken";
import { OrganizationType } from "../data/dataType";
import { sendMagicLinkEmail } from "../lib/email";

export interface UserPayload {
  id: string;
  email: string;
  orgType: string;
  organisationId: string;
}

// Helper to hash tokens before database saves
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestMagicLink(email: string): Promise<void> {
  // Query user and join with organisations to get the type
  const query = `
    SELECT u.id, u.is_active
    FROM users u
    WHERE u.email = $1
  `;
  const result = await pool.query(query, [email]);
  const user = result.rows[0];

  // Silent failure to prevent email enumeration
  if (!user || !user.is_active) {
    return;
  }

  // Generate raw token for email and hashed token for db
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);

  // Expire in 5 min
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Insert into the table
  const insertQuery = `
    INSERT INTO login_tokens (user_id, token_hash, expires_at, used_at)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(insertQuery, [user.id, hashedToken, expiresAt, null]);

  // Send the email with the rawToken
  await sendMagicLinkEmail(email, rawToken);
}

export async function verifyMagicLinkToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);

  // Find matching token in login_tokens table
  const query = `
    SELECT 
      lt.id as token_id, 
      lt.expires_at, 
      lt.used_at,
      u.id as user_id, 
      u.email, 
      u.is_active,
      o.type as org_type
    FROM login_tokens lt
    JOIN users u ON lt.user_id = u.id
    LEFT JOIN organisations o ON u.organisation_id = o.id
    WHERE lt.token_hash = $1
  `;
  const result = await pool.query(query, [hashedToken]);
  const record = result.rows[0];

  // Validate token existence and user status
  if (!record || !record.is_active) {
    throw new Error("Invalid or expired link.");
  }

  // Check if token was already  used means used_at is NOT NULL
  if (record.used_at !== null) {
    throw new Error("Link has already been used.");
  }

  // Check 5 min expiration
  const now = new Date();
  if (now > new Date(record.expires_at)) {
    throw new Error("Link has expired.");
  }

  // Mark token as used by setting used_at = NOW() this invalidate any future clicks.
  await pool.query(`UPDATE login_tokens SET used_at = NOW() WHERE id = $1`, [
    record.token_id,
  ]);

  // Update user's last_login_at
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [
    record.user_id,
  ]);

  // Determine redirect route based on organisation type
  let redirectRoute = "/"; // default fallback

  switch (record.org_type) {
    case OrganizationType.COMMERCIAL_PARTNER:
      redirectRoute = "/commercial-partner";
      break;
    case OrganizationType.OUTREACH_PARTNER:
      redirectRoute = "/outreach-partner";
      break;
    case OrganizationType.CYF_STAFF:
      redirectRoute = "/cyf-staff";
      break;
  }
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  // Generate JWT Session Token exp 24h
   const payload: UserPayload = {
    id: record.user_id,
    email: record.email,
    orgType: record.org_type,
    organisationId: record.organisation_id,
  };

  const sessionToken = jwt.sign(payload, jwtSecret, { expiresIn: "24h" });
  
  // return user session identity as object, and the redirectRout.
  return {
    token: sessionToken,
    user: {
      id: record.user_id,
      email: record.email,
      orgType: record.org_type,
    },
    redirectRoute,
  };
}
