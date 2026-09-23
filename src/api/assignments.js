import { request } from "./client";

// At least one of content / fileUrl is required by the backend.
export async function submitAssignment(assignmentId, { content, fileUrl }) {
  const data = await request(`/assignments/${assignmentId}/submit`, {
    method: "POST",
    body: { content, file_url: fileUrl },
  });
  return data.submission;
}

export async function gradeSubmission(submissionId, { score, feedback }) {
  const data = await request(`/submissions/${submissionId}/grade`, {
    method: "POST",
    body: { score, feedback },
  });
  return data.grade;
}
