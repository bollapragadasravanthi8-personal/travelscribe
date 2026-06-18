/**
 * Runs Prisma migrations using DIRECT_URL (required for Supabase).
 * Loads .env.local automatically — no manual export needed.
 */
const { config } = require("dotenv");
const { execSync } = require("child_process");

config({ path: ".env.local" });
config({ path: ".env" });

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  console.error("Missing DIRECT_URL in .env.local");
  process.exit(1);
}

execSync("npx prisma migrate dev", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: directUrl },
});
