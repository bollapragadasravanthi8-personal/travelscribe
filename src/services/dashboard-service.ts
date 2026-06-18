import { cache } from "react";

import { getDashboardDataForUser } from "@/repositories/dashboard-repository";

export const getDashboardOverviewForUser = cache(async (userId: string) => {
  return getDashboardDataForUser(userId);
});
