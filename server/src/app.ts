import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";
import { OrganizationType } from "./data/dataType";
import { authorizeRole } from "./middleware/authMiddleware";

// --- Import all your API handlers here
import testEndPoint from "./api/testEndPoint";
import testSwagger from "./api/testSwagger";
import getCoursePipeline from "./api/coursePipeline";
import getCommercialDashboard from "./api/commercialDashboard";
import getAvailableOpportunities from "./api/availableOpportunities";
import getCourseDetails from "./api/CourseDetails";
import authRouter from "./auth/auth.router";
import addPartner from "./api/addPartner";
import getOrganisations from "./api/getOrganisations";
import addUserToPartner from "./api/addUserToPartner";
import requestNewCourse from "./api/requestNewCourse";
import updateCourseStatus from "./api/updateCourseStatus";

const app = express();

app.use(cors());
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

app.get("/test", testEndPoint);
app.post("/api/testSwagger", testSwagger);

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

// Shared Routes
app.get("/course-details/:id", getCourseDetails); // Shared

app.use("/auth", authRouter);

export default app;
