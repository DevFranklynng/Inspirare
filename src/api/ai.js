import { request } from "./client";

// AI Sub-Instructor API client.
//
// Every call goes through the shared `request` helper, so auth headers,
// JSON handling and the global 401 behaviour are identical to the rest of the
// app. No component calls fetch() directly, and nothing here ever sees a
// provider credential — the backend only ever returns a redacted status.

/** Provider configuration + availability. Safe for any signed-in user. */
export async function fetchAiStatus() {
  return request("/ai/status");
}

// --- content generation (instructor) ---------------------------------------

export async function generateLecture(payload) {
  const data = await request("/ai/lectures/generate", { method: "POST", body: payload });
  return { generation: data.generation, content: data.content };
}

export async function generateMaterial(payload) {
  const data = await request("/ai/materials/generate", { method: "POST", body: payload });
  return { generation: data.generation, content: data.content };
}

export async function generateAssignment(payload) {
  const data = await request("/ai/assignments/generate", { method: "POST", body: payload });
  return { generation: data.generation, content: data.content };
}

/** Returns the draft plus a printable answer key (instructor-only). */
export async function generateQuiz(payload) {
  const data = await request("/ai/quizzes/generate", { method: "POST", body: payload });
  return { generation: data.generation, content: data.content, answerKey: data.answer_key };
}

// --- draft review & publishing ----------------------------------------------

export async function fetchGenerations(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const suffix = query.toString() ? `?${query}` : "";
  const data = await request(`/ai/generations${suffix}`);
  return data.generations;
}

export async function fetchGeneration(id) {
  const data = await request(`/ai/generations/${id}`);
  return data.generation;
}

export async function updateGeneration(id, { title, content }) {
  const data = await request(`/ai/generations/${id}`, { method: "PATCH", body: { title, content } });
  return data.generation;
}

export async function setGenerationStatus(id, status, note) {
  const data = await request(`/ai/generations/${id}/status`, { method: "POST", body: { status, note } });
  return data.generation;
}

export async function publishGeneration(id, { module_id, due_date } = {}) {
  const data = await request(`/ai/generations/${id}/publish`, { method: "POST", body: { module_id, due_date } });
  return data;
}

export async function deleteGeneration(id) {
  return request(`/ai/generations/${id}`, { method: "DELETE" });
}

// --- grading ----------------------------------------------------------------

export async function evaluateSubmission(submissionId) {
  const data = await request(`/ai/submissions/${submissionId}/evaluate`, { method: "POST" });
  return data.evaluation;
}

export async function fetchEvaluations(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const suffix = query.toString() ? `?${query}` : "";
  const data = await request(`/ai/evaluations${suffix}`);
  return data.evaluations;
}

export async function fetchEvaluation(id) {
  const data = await request(`/ai/evaluations/${id}`);
  return data;
}

/** action: "accept" | "edit" | "reject". Score/feedback required for "edit". */
export async function reviewEvaluation(id, { action, score, feedback }) {
  const data = await request(`/ai/evaluations/${id}/review`, {
    method: "POST",
    body: { action, score, feedback },
  });
  return data;
}

// --- student tutor ----------------------------------------------------------

export async function askTutor(payload) {
  const data = await request("/ai/tutor", { method: "POST", body: payload });
  return data;
}

export async function fetchTutorConversations() {
  const data = await request("/ai/tutor/conversations");
  return data.conversations;
}

export async function fetchTutorConversation(id) {
  const data = await request(`/ai/tutor/conversations/${id}`);
  return data.conversation;
}

// --- history ----------------------------------------------------------------

export async function fetchAiHistory(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const suffix = query.toString() ? `?${query}` : "";
  return request(`/ai/history${suffix}`);
}
