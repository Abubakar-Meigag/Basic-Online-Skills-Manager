import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";
import { OrganizationType } from "./data/dataType";
import { authorizeRole } from "./middleware/authMiddleware";

// --- Import all your API handlers here
import getCoursePipeline from "./api/coursePipeline";
import getCommercialDashboard from "./api/commercialDashboard";
import getAvailableOpportunities from "./api/availableOpportunities";
import getOutreachCourses from "./api/outreachCourses";
import authRouter from "./auth/auth.router";
import addPartner from "./api/addPartner";
import getOrganisations from "./api/getOrganisations";
import addUserToPartner from "./api/addUserToPartner";
import requestNewCourse from "./api/requestNewCourse";
import updateCourseStatus from "./api/updateCourseStatus";
import claimOpportunity from "./api/claimOpportunity";
import getStaffCourseDetails from "./api/getStaffCourseDetails";
import getCommercialCourseDetails from "./api/getCommercialCourseDetails";
import getOutreachCourseDetails from "./api/getOutreachCourseDetails";
import getUsers from "./api/getUsers";
import getAuditLog from "./api/getAuditLog";
import updateUserStatus from "./api/updateUserStatus";

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Routes ---
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to Basic Online Skills Manager");
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "Server is healthy" });
});

// Protected routes
app.get(
  "/course-pipeline",
  authorizeRole(OrganizationType.CYF_STAFF),
  getCoursePipeline,
);
app.get(
  "/commercial-dashboard",
  authorizeRole(OrganizationType.COMMERCIAL_PARTNER),
  getCommercialDashboard,
);
app.get(
  "/opportunities",
  authorizeRole(OrganizationType.OUTREACH_PARTNER),
  getAvailableOpportunities,
);
app.get(
  "/organisations",
  authorizeRole(OrganizationType.CYF_STAFF),
  getOrganisations,
);
app.get("/users", authorizeRole(OrganizationType.CYF_STAFF), getUsers);
app.patch(
  "/users/:id/status",
  authorizeRole(OrganizationType.CYF_STAFF),
  updateUserStatus,
);
app.post("/addPartner", authorizeRole(OrganizationType.CYF_STAFF), addPartner);
app.post(
  "/partners/:id/users",
  authorizeRole(OrganizationType.CYF_STAFF),
  addUserToPartner,
);

app.post(
  "/commercial/requestedNewCourses",
  authorizeRole(OrganizationType.COMMERCIAL_PARTNER),
  requestNewCourse,
);

app.patch(
  "/course/:id/status",
  authorizeRole(OrganizationType.CYF_STAFF),
  updateCourseStatus,
);

app.get(
  "/outreach/courses",
  authorizeRole(OrganizationType.OUTREACH_PARTNER),
  getOutreachCourses,
);
app.post(
  "/courses/:id/claim",
  authorizeRole(OrganizationType.OUTREACH_PARTNER),
  claimOpportunity,
);

app.get(
  "/course-details/staff/:id",
  authorizeRole(OrganizationType.CYF_STAFF),
  getStaffCourseDetails,
);
app.get(
  "/course-details/commercial/:id",
  authorizeRole(OrganizationType.COMMERCIAL_PARTNER),
  getCommercialCourseDetails,
);
app.get(
  "/course-details/outreach/:id",
  authorizeRole(OrganizationType.OUTREACH_PARTNER),
  getOutreachCourseDetails,
);

app.get("/audit-log", authorizeRole(OrganizationType.CYF_STAFF), getAuditLog);

app.use("/auth", authRouter);

export default app;
