import client from "./client";

export function getAllWeatherData() {
  return client.get("/api/weather/all").then((res) => res.data);
}

export function fetchWeatherData(district) {
  return client
    .post("/api/weather/fetch", null, { params: district ? { district } : {} })
    .then((res) => res.data);
}

export function getWeatherAdvisory(district) {
  return client
    .get("/api/weather/advisory", { params: { district } })
    .then((res) => res.data);
}
