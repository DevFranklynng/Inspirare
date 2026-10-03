import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboard } from "../api/dashboard";
import { fetchCourseAssignments } from "../api/courses";
import { submitAssignment } from "../api/assignments";
import { ApiError } from "../api/client";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import AssignmentCard from "../components/assignments/AssignmentCard";
import AssignmentManager from "../components/instructor/AssignmentManager";
import CourseScopedManager from "../components/instructor/CourseScopedManager";
import { ClipboardList, BookOpen } from "lucide-react";

// Students see every assignment across their enrolled course(s), pulled from
// the real per-course endpoint (so description/max_score are available, not
// just the trimmed "still due" shape the dashboard summary carries).
// Instructors get the full course-scoped management panel (create, edit, grade).

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [hasEnrolledCourse, setHasEnrolledCourse] = useState(true);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [results, setResults] = useState({});

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const dashboard = await fetchDashboard();
      const enrolledCourses = dashboard.enrolled_courses || [];
      setHasEnrolledCourse(enrolledCourses.length > 0);

      const perCourse = await Promise.all(
        enrolledCourses.map(async (c) => {
          const courseAssignments = await fetchCourseAssignments(c.course_id);
          return (courseAssignments || []).map((a) => ({ ...a, course_title: c.title }));
        })
      );

      const merged = perCourse.flat().sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });

      setAssignments(merged);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your assignments.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(assignmentId, payload) {
    setSubmittingId(assignmentId);
    try {
      await submitAssignment(assignmentId, payload);
      setResults((r) => ({ ...r, [assignmentId]: { type: "success", message: "Submitted." } }));
    } catch (err) {
      setResults((r) => ({
        ...r,
        [assignmentId]: { type: "error", message: err instanceof ApiError ? err.message : "Submission failed." },
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  if (status === "loading") return <LoadingState label="Loading assignments…" variant="assignment" count={4} />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Assignments</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">Work assigned across your enrolled courses.</p>
      </div>

      {!hasEnrolledCourse ? (
        <EmptyState icon={BookOpen} title="You're not enrolled in a course yet" description="An administrator enrolls you in a course. Once they have, your assignments show up here." />
      ) : assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments yet" description="Assignments your instructor posts will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              courseTitle={a.course_title}
              onSubmit={handleSubmit}
              isSubmitting={submittingId === a.id}
              result={results[a.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Assignments() {
  const { isInstructor } = useAuth();

  if (isInstructor) {
    return (
      <CourseScopedManager
        title="Assignments"
        subtitle="Create assignments and grade submissions across your courses."
        renderManager={(courseId) => <AssignmentManager key={courseId} courseId={courseId} />}
      />
    );
  }

  return <StudentAssignments />;
}
