import client from "./client";

export function getAllMandiPrices() {
  return client.get("/api/mandi/all").then((res) => res.data);
}

export function fetchMandiPrices() {
  return client.post("/api/mandi/fetch").then((res) => res.data);
}

export function getMandiTrend(cropName) {
  return client
    .get("/api/mandi/trends", { params: { cropName } })
    .then((res) => res.data);
}
