import { request } from "./client";

export async function createLesson(moduleId, { title, videoUrl, notes, orderIndex = 0 }) {
  const data = await request(`/modules/${moduleId}/lessons`, {
    method: "POST",
    body: { title, video_url: videoUrl, notes, order_index: orderIndex },
  });
  return data.lesson;
}

export async function updateLesson(lessonId, patch) {
  const data = await request(`/lessons/${lessonId}`, {
    method: "PATCH",
    body: patch,
  });
  return data.lesson;
}

export async function deleteLesson(lessonId) {
  return request(`/lessons/${lessonId}`, { method: "DELETE" });
}

// Upserts, so calling it more than once is harmless -- safe to call
// optimistically from the UI.
export async function completeLesson(lessonId) {
  const data = await request(`/lessons/${lessonId}/complete`, { method: "POST" });
  return data.progress;
}
