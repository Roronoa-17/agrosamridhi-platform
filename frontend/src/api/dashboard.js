import client from "./client";

export function getUnifiedDashboard() {
  return client
    .get("/api/v1/dashboard/summary")
    .then((res) => res.data);
}
