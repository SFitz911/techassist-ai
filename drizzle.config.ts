import { defineConfig } from "drizzle-kit";

// Use a default database URL if not provided (for demo purposes)
const databaseUrl = process.env.DATABASE_URL || "postgresql://demo:demo@localhost:5432/techassist_demo";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
