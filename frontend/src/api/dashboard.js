import client from "./client";

export function getUnifiedDashboard(farmerId) {
  return client.get(`/api/v1/dashboard/${farmerId}`).then((res) => res.data);
}
