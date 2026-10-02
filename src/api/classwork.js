import { request } from "./client";

// Classwork: in-class coding exercises with a live instructor monitor.
//
// The student half (saveMyEntry / submitMyEntry) is on the hot path - it fires
// roughly every 1.5s while the student types - so the workspace debounces it
// before it gets here, and saveMyEntry deliberately returns only the entry's
// status and timestamps rather than echoing the code back.

export async function listCourseClasswork(courseId) {
  const data = await request(`/courses/${courseId}/classwork`);
  return data.classworks;
}

export async function createClasswork(courseId, { title, instructions, starterFiles, sessionId }) {
  const data = await request(`/courses/${courseId}/classwork`, {
    method: "POST",
    body: {
      title,
      instructions,
      starter_files: starterFiles,
      session_id: sessionId || null,
    },
  });
  return data.classwork;
}

export async function getClasswork(classworkId) {
  const data = await request(`/classwork/${classworkId}`);
  return data.classwork;
}

export async function updateClasswork(classworkId, patch) {
  const data = await request(`/classwork/${classworkId}`, {
    method: "PATCH",
    body: patch,
  });
  return data.classwork;
}

export async function deleteClasswork(classworkId) {
  return request(`/classwork/${classworkId}`, { method: "DELETE" });
}

// The student's own work. The backend takes student_id from the token, so
// there is nothing to pass here that could point this at a classmate.

export async function fetchMyEntry(classworkId) {
  const data = await request(`/classwork/${classworkId}/entry`);
  return data.entry;
}

export async function saveMyEntry(classworkId, files, status) {
  const data = await request(`/classwork/${classworkId}/entry`, {
    method: "PUT",
    body: { files, status },
  });
  return data.entry;
}

export async function submitMyEntry(classworkId, files) {
  const data = await request(`/classwork/${classworkId}/entry/submit`, {
    method: "POST",
    // Omitted when undefined so a plain hand-in does not re-upload every file.
    ...(files === undefined ? {} : { body: { files } }),
  });
  return data.entry;
}

// Instructor-only: every student's work on one task.
export async function fetchClassworkMonitor(classworkId) {
  const data = await request(`/classwork/${classworkId}/monitor`);
  return { students: data.students, summary: data.summary };
}