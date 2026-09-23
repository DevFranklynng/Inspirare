import { request } from "./client";

export async function fetchCourses() {
  const data = await request("/courses");
  return data.courses;
}

export async function fetchCourse(id) {
  const data = await request(`/courses/${id}`);
  return data.course;
}

export async function createCourse({ title, description }) {
  const data = await request("/courses", {
    method: "POST",
    body: { title, description },
  });
  return data.course;
}

export async function updateCourse(id, patch) {
  const data = await request(`/courses/${id}`, {
    method: "PATCH",
    body: patch,
  });
  return data.course;
}

export async function enrollInCourse(id) {
  const data = await request(`/courses/${id}/enroll`, { method: "POST" });
  return data.enrollment;
}

export async function createModule(courseId, { title, orderIndex = 0 }) {
  const data = await request(`/courses/${courseId}/modules`, {
    method: "POST",
    body: { title, order_index: orderIndex },
  });
  return data.module;
}

export async function createAssignment(courseId, { title, description, dueDate, maxScore }) {
  const data = await request(`/courses/${courseId}/assignments`, {
    method: "POST",
    body: {
      title,
      description,
      due_date: dueDate,
      max_score: maxScore,
    },
  });
  return data.assignment;
}
