import { request } from "./client";

/**
 * Lesson progress. Completion is granted by the instructor, so this is the
 * instructor's write and both roles' read.
 */

/**
 * The whole class-vs-lessons grid: the ordered lesson list plus, for every
 * enrolled student, which lessons they have been credited with. One request,
 * because a per-student endpoint would make the instructor screen N+1.
 */
export async function fetchCourseProgress(courseId) {
  const data = await request(`/courses/${courseId}/progress`);
  return {
    lessons: data.lessons || [],
    students: data.students || [],
    totalLessons: data.total_lessons || 0,
  };
}

/** The caller's own progress in a course. Enrolment required. */
export async function fetchMyProgress(courseId) {
  const data = await request(`/courses/${courseId}/progress/me`);
  return {
    completedLessonIds: data.completed_lesson_ids || [],
    completedCount: data.completed_count || 0,
    totalLessons: data.total_lessons || 0,
    percent: data.percent || 0,
  };
}
