import client from "./client";

export function registerFarmer(payload) {
  return client.post("/api/auth/register", payload).then((res) => res.data);
}

export function login(email, password) {
  return client.post("/api/auth/login", { email, password }).then((res) => res.data);
}

export function getMyProfile() {
  return client.get("/api/auth/profile").then((res) => res.data);
}

export function getProfileById(id) {
  return client.get(`/api/auth/profile/${id}`).then((res) => res.data);
}
