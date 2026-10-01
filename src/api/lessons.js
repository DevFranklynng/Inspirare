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

// Instructor-only: the instructor credits a STUDENT with having covered a
// lesson, rather than the student claiming it themselves. Upserts, so marking
// the same pair twice is harmless. Pass completed: false to take it back.
export async function completeLesson(lessonId, studentId, completed = true) {
  const data = await request(`/lessons/${lessonId}/complete`, {
    method: "POST",
    body: { student_id: studentId, completed },
  });
  return data.progress;
}
