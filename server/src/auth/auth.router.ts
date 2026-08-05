import { Router } from "express";
import {
  handleRequestMagicLink,
  handleVerifyMagicLink,
} from "./auth.controller";

const authRouter = Router();

/**
 * @route   POST /api/auth/magic-link
 * @desc    Request a magic link sent to user email
 * @access  Public
 */
authRouter.post("/magic-link", handleRequestMagicLink);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify raw magic link token and authenticate user
 * @access  Public
 */
authRouter.post("/verify", handleVerifyMagicLink);

/**
 * @route   GET /api/auth/verify
 * @desc    Fallback route to allow verifying tokens via direct URL query string
 * @access  Public
 */
authRouter.get("/verify", handleVerifyMagicLink);

export default authRouter;
