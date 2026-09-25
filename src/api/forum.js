import { request } from "./client";

// Forum API — students and instructors share one course-friendly space.
// The backend keeps threads loosely course-scoped (course_id is nullable:
// scoped threads show on a course, null ones are general "water cooler"
// threads) and restricted to student/instructor roles only, so admins are
// never routed into the forum from the app area.

export async function listThreads({ courseId } = {}) {
  const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : "";
  const data = await request(`/forum${query}`);
  return data.threads || [];
}

export async function getThread(threadId) {
  const data = await request(`/forum/${threadId}`);
  return data.thread;
}

export async function createThread({ title, body, courseId }) {
  const data = await request("/forum", {
    method: "POST",
    body: { title, body, course_id: courseId || undefined }
  });
  return data.thread;
}

export async function createReply({ threadId, body }) {
  const data = await request(`/forum/${threadId}/replies`, {
    method: "POST",
    body: { body }
  });
  return data.reply;
}
