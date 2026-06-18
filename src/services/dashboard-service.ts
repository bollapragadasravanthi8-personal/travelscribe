import { getDashboardDataForUser } from "@/repositories/dashboard-repository";

export async function getDashboardOverviewForUser(userId: string) {
  return getDashboardDataForUser(userId);
}
