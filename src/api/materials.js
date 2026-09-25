import { request } from "./client";

// Course materials (files, links, notes, other).

export async function fetchCourseMaterials(courseId) {
  const data = await request(`/courses/${courseId}/materials`);
  return data.materials;
}

export async function createMaterial(courseId, { title, type, description, url }) {
  const data = await request(`/courses/${courseId}/materials`, {
    method: "POST",
    body: { title, type: type || "file", description, url },
  });
  return data.material;
}

export async function updateMaterial(materialId, patch) {
  const data = await request(`/materials/${materialId}`, {
    method: "PATCH",
    body: patch,
  });
  return data.material;
}

export async function deleteMaterial(materialId) {
  return request(`/materials/${materialId}`, { method: "DELETE" });
}