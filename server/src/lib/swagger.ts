import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BOSM API",
      version: "1.0.0",
      description: "API for Basic Online Skills course management",
    },
    servers: [{ url: "http://localhost:3000", description: "Local dev" }],
    components: {
      schemas: {
        Course: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            course_name: { type: "string" },
            commercial_org_id: { type: "string", format: "uuid" },
            outreach_org_id: { type: "string", format: "uuid", nullable: true },
            account_name: { type: "string" },
            contract_name: { type: "string" },
            trainee_target: { type: "integer" },
            deadline: { type: "string", format: "date" },
            city: { type: "string" },
            status: {
              type: "string",
              enum: [
                "request_pending",
                "request_open",
                "request_cancelled",
                "request_claimed",
                "request_confirmed",
                "course_running",
                "course_completed",
              ],
            },
          },
        },
      },
    },
  },
  apis: ["./src/api/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
