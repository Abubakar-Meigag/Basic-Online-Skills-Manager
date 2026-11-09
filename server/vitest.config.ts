import { defineConfig, configDefaults } from "vitest/config";

const JWT_TEST_SECRET = "test-secret";
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: [...configDefaults.exclude, "dist/**"],
    env: { JWT_SECRET: JWT_TEST_SECRET },
  },
});
