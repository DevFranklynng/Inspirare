import { request } from "./client";

export async function fetchStudents() {
  const data = await request("/admin/students");
  return data.students;
}

export async function fetchUsers() {
  const data = await request("/admin/users");
  return data.users;
}

export async function fetchInstructors() {
  const data = await request("/admin/instructors");
  return data.instructors;
}

export async function fetchEnrollments() {
  const data = await request("/admin/enrollments");
  return data.enrollments;
}

export async function fetchAllCourses() {
  const data = await request("/admin/courses");
  return data.courses;
}

// Creates a brand-new account (student/instructor/admin) as the admin. The
// caller picks the password, so the response only needs the created user —
// the UI prints the email + password it just used as the hand-off.
export async function registerProfile({ email, password, fullName, role }) {
  const data = await request("/admin/register", {
    method: "POST",
    body: { email, password, full_name: fullName, role },
  });
  return data.user;
}

export async function updateUserRole({ userId, role }) {
  const data = await request(`/admin/profiles/${userId}`, {
    method: "PATCH",
    body: { role },
  });
  return data.profile;
}

export async function createCourse({ title, description, instructorId }) {
  const data = await request("/admin/courses", {
    method: "POST",
    body: { title, description, instructor_id: instructorId },
  });
  return data.course;
}

export async function updateCourse(id, patch) {
  const data = await request(`/admin/courses/${id}`, {
    method: "PATCH",
    body: patch,
  });
  return data.course;
}

export async function enrollStudent({ studentId, courseId }) {
  const data = await request("/admin/enroll", {
    method: "POST",
    body: { student_id: studentId, course_id: courseId },
  });
  return data.enrollment;
}

export async function unenrollStudent({ studentId, courseId }) {
  const data = await request("/admin/enroll", {
    method: "DELETE",
    body: { student_id: studentId, course_id: courseId },
  });
  return data;
}