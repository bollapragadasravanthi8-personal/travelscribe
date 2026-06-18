import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type CheckStatus = "ok" | "skipped" | "error";

async function checkDatabase(): Promise<CheckStatus> {
  if (!env.databaseUrl) {
    return "skipped";
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

function checkSupabase(): CheckStatus {
  if (!env.supabase.url || !env.supabase.anonKey) {
    return "skipped";
  }
  return "ok";
}

/**
 * Health check endpoint for deployment monitoring.
 */
export async function GET() {
  const [database] = await Promise.all([checkDatabase()]);
  const supabase = checkSupabase();

  const checks = { database, supabase };
  const hasError = Object.values(checks).includes("error");

  return NextResponse.json(
    {
      status: hasError ? "degraded" : "ok",
      service: "travelscribe",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: hasError ? 503 : 200 },
  );
}
