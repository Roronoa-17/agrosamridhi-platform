import client from "./client";

export function getMatchedSchemes() {
  return client.get("/api/schemes/match").then((res) => res.data);
}

export function getEligibleSchemes() {
  return client.get("/api/schemes/match").then((res) => res.data);
}

export function getAllSchemes() {
  return client.get("/api/schemes/all").then((res) => res.data);
}
