import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to Basic Online Skills Manager");
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "Server is healthy" });
});
//don't change anything above this line, you can add your endpoints below this line

// Import your endpoint handlers here and define your routes after

// Example endpoint handler import and route definition
import testEndPoint from "./api/testEndPoint";
app.get("/test", testEndPoint);
import testSwagger from "./api/testSwagger";
app.post("/api/testSwagger", testSwagger);

// add BOSM API endpoints here below

import getCoursePipeline from "./api/coursePipeline";
app.get("/course-pipeline", getCoursePipeline);

import getCommercialDashboard from "./api/commercialDashboard";
app.get("/commercial-dashboard", getCommercialDashboard);

import getCourseDetails from "./api/CourseDetails";
app.get("/course-details/:id", getCourseDetails);

export default app;
