/**
 * Centralized environment variable access.
 * Validates required vars at runtime when accessed.
 */

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

export const env = {
  // App
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: getEnv("NEXT_PUBLIC_APP_URL", false) || "http://localhost:3000",

  // Database (Supabase PostgreSQL)
  databaseUrl: getEnv("DATABASE_URL", false),
  directUrl: getEnv("DIRECT_URL", false),

  // Supabase
  supabase: {
    url: getEnv("NEXT_PUBLIC_SUPABASE_URL", false),
    anonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", false),
    serviceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", false),
  },

  // Supabase Storage
  storage: {
    bucket: getEnv("NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET", false) || "travel-photos",
  },

  // AI — Google Gemini (Phase 8+)
  ai: {
    geminiApiKey: getEnv("GEMINI_API_KEY", false),
  },
} as const;
