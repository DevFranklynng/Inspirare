import { request } from "./client";

export async function fetchStudents() {
  const data = await request("/admin/students");
  return data.students;
}

export async function fetchAllCourses() {
  const data = await request("/admin/courses");
  return data.courses;
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
