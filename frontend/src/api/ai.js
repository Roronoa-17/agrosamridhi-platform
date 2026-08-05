import client from "./client";

export function getCropSuggestion(payload) {
  return client.post("/api/ai/crop-suggestions", payload).then((res) => res.data);
}

export function diagnosePest(file) {
  const formData = new FormData();
  formData.append("file", file);
  return client
    .post("/api/ai/pest-diagnosis", formData)
    .then((res) => res.data);
}

export function extractSoilNutrients(file) {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/api/ai/soil-ocr", formData).then((res) => res.data);
}
