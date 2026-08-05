import client from "./client";

export function getAllMandiPrices({ state, district } = {}) {
  return client
    .get("/api/mandi/all", { params: { state, district } })
    .then((res) => res.data);
}

export function fetchMandiPrices() {
  return client.post("/api/mandi/fetch").then((res) => res.data);
}

export function getMandiTrend(cropName, { state, district } = {}) {
  return client
    .get("/api/mandi/trends", { params: { cropName, state, district } })
    .then((res) => res.data);
}
