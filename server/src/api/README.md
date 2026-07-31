# Swagger / API Docs Guide

This folder (`/lib/swagger.ts`) holds the base config for our API documentation.
Docs are viewable at: `http://localhost:3000/docs`

Every teammate adding a new endpoint needs to do **two things**:
1. Add a schema (if it's a new entity/table) to `components.schemas` in `swagger.ts`
2. Add a `@swagger` comment block above their route handler in `src/api/*.ts`

---

## 1. Adding a new schema

`components.schemas` in `swagger.ts` is just a list of reusable object shapes — one entry per table/entity (`Course`, `User`, etc.).

If you're building an endpoint for an entity that **already has a schema** (e.g. `/api/testSwagger`), skip this step — just reference it in your route comment (see step 2).

If you're building an endpoint for a **new entity** that doesn't have a schema yet, add it here:

```ts
components: {
  schemas: {
    Course: {
      // ...unchanged
    },
    User: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string", format: "email" },
        organisation_id: { type: "string", format: "uuid", nullable: true },
        is_active: { type: "boolean" },
        created_at: { type: "string", format: "date-time" },
        last_login_at: { type: "string", format: "date-time", nullable: true },
      },
    },
  },
},
```

**Rules of thumb:**
- One schema per table, matching the actual Postgres columns.
- Field types should match Postgres types (`UUID` → `string, format: uuid`, `TIMESTAMPTZ` → `string, format: date-time`, `BOOLEAN` → `boolean`, etc.).
- Nullable Postgres columns → add `nullable: true`.
- Enum columns → use `enum: [...]` with the exact values from the Postgres `CREATE TYPE`.

⚠️ If you skip this step and your route tries to `$ref` a schema that doesn't exist, Swagger UI will show it as broken/unresolved — same as if it wasn't there at all.

---

## 2. Adding a route annotation

Every route file lives in `src/api/*.ts` (this is the folder `swagger.ts` scans — see the `apis` array). Above your route handler, add a `@swagger` comment block describing the endpoint.

**Template — copy this pattern for every new endpoint:**

```ts
/**
 * @swagger
 * /api/your-path:
 *   post:
 *     summary: Short description of what this does
 *     tags: [YourEntityName]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field_one:
 *                 type: string
 *               field_two:
 *                 type: integer
 *     responses:
 *       201:
 *         description: What success looks like
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourEntityName'
 */
export default function yourHandler(req: Request, res: Response) {
  // your logic
}
```

**Real example — `POST /api/testSwagger`:**

```ts
/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Submit a new course request (Commercial partner)
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_name:
 *                 type: string
 *               contract_name:
 *                 type: string
 *               city:
 *                 type: string
 *               trainee_target:
 *                 type: integer
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Course request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 */
```

---

## 3. Checklist before opening a PR

- [ ] New entity? -> schema added to `components.schemas` in `swagger.ts`
- [ ] `@swagger` block added above the route handler
- [ ] Path in the comment matches the actual Express route path exactly
- [ ] `$ref` points to a schema that actually exists
- [ ] Ran the server locally and confirmed the endpoint shows up at `/api-docs`
- [ ] Clicked "Try it out" once to confirm it actually works, not just renders

---

## Common mistakes (seen already, avoid these)

- **Route not showing up at all** → almost always the file isn't inside `src/api/` (the folder `swagger.ts`'s `apis` glob scans), or the server wasn't restarted after adding the comment.
- **Broken/empty `$ref`** → schema name in the comment doesn't match the schema name in `components.schemas` exactly (case-sensitive).
- **Docs and code disagree** → someone changed the route path or fields in code but forgot to update the comment. The comment is *not* auto-synced with your code — you have to keep it updated manually.