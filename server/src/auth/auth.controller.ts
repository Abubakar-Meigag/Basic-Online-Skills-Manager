import { Request, Response } from "express";
import { requestMagicLink, verifyMagicLinkToken } from "./auth.service";

/**
 * POST /api/auth/magic-link
 * Request a magic link to be sent to the given email address.
 */
export async function handleRequestMagicLink(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const sanitisedEmail = email.trim().toLowerCase().replace(/[\n\r]/g, "_");

    // Call service layer to query user, store hashed token, and dispatch email/log
    await requestMagicLink(sanitisedEmail);

    // return 200 OK to prevent email enumeration
    return res.status(200).json({
      message: "If an account exists, a link has been sent.",
    });
  } catch (error) {
    console.error("Error in handleRequestMagicLink:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * GET or POST /api/auth/verify
 * Verify a magic link raw token, update used status, and return user payload + redirect route.
 */
export async function handleVerifyMagicLink(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    // Extract token from query parameter or request body
    const token =
      (req.query.token as string) || (req.body && (req.body.token as string));

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token is required." });
    }

    // Call verifyMagicLinkToken to validate token against db and return user details plus route
    const result = await verifyMagicLinkToken(token.trim());

    return res.status(200).json({
      message: "Authentication successful.",
      token: result.token,
      user: result.user,
      redirectRoute: result.redirectRoute,
    });
  } catch (error: any) {
    console.error("Error in handleVerifyMagicLink:", error.message);

    // Return 400 with the error.
    return res.status(400).json({ error: error.message || "Invalid token." });
  }
}
