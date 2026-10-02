import { request } from "./client";

// Live class scheduling + attendance.

export async function fetchCourseSessions(courseId) {
  const data = await request(`/courses/${courseId}/sessions`);
  return data.sessions;
}

/**
 * The caller's own attendance across a whole course, not one session at a time:
 * every session with its status, plus the totals. Read-only for the student -
 * attendance is recorded by the instructor.
 */
export async function fetchMyAttendance(courseId) {
  const data = await request(`/courses/${courseId}/attendance/me`);
  return {
    records: data.records || [],
    summary: data.summary || {
      total_sessions: 0,
      present: 0,
      absent: 0,
      unmarked: 0,
      attendance_percent: 0,
      is_marked: false,
    },
  };
}

export async function createSession(courseId, { title, startsAt, endsAt, description, location }) {
  const data = await request(`/courses/${courseId}/sessions`, {
    method: "POST",
    body: {
      title,
      starts_at: startsAt,
      ends_at: endsAt || null,
      description,
      location,
    },
  });
  return data.session;
}

export async function updateSession(sessionId, patch) {
  const data = await request(`/sessions/${sessionId}`, {
    method: "PATCH",
    body: patch,
  });
  return data.session;
}

export async function deleteSession(sessionId) {
  return request(`/sessions/${sessionId}`, { method: "DELETE" });
}

export async function fetchSessionAttendance(sessionId) {
  const data = await request(`/sessions/${sessionId}/attendance`);
  return data.attendance;
}

export async function markAttendance(sessionId, records) {
  const data = await request(`/sessions/${sessionId}/attendance`, {
    method: "POST",
    body: { records },
  });
  return data.attendance;
}