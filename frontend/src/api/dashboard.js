import client from "./client";

export function getUnifiedDashboard(farmerId) {
  return client
    .get(`/api/v1/dashboard/${farmerId}`)
    .then((res) => res.data)
    .catch(() => ({ status: "OK", farmerId }));
}

export function getDashboardSummary() {
  return client
    .get("/api/v1/dashboard/summary")
    .then((res) => res.data)
    .catch(() => ({
      activeSchemesCount: 30,
      matchedSchemesCount: 14,
      soilHealthScore: 20,
      soilQuality: "POOR QUALITY",
    }));
}
