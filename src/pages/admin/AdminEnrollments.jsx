import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UserPlus, Users, GraduationCap, Trash2 } from "lucide-react";
import { fetchStudents, fetchAllCourses, fetchEnrollments, enrollStudent, unenrollStudent } from "../../api/admin";
import { ApiError } from "../../api/client";
import {
  AdminPanel,
  AdminSelect,
  AdminButton,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
  StatusBadge,
  ConfirmDialog,
} from "../../features/admin/components/AdminUi";

export default function AdminEnrollments() {
  const [searchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [studentId, setStudentId] = useState(searchParams.get("studentId") || "");
  const [courseId, setCourseId] = useState(searchParams.get("courseId") || "");
  const [action, setAction] = useState(null); // "enroll" | "unenroll" | null
  const [notice, setNotice] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [studentsData, coursesData, enrollmentsData] = await Promise.all([
        fetchStudents(),
        fetchAllCourses(),
        fetchEnrollments(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load students, courses and enrollments.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // One course per student: anyone already enrolled is hidden from the
  // enroll picker and shown in the "current enrollments" list instead.
  const enrolledStudentIds = useMemo(() => new Set(enrollments.map((e) => e.student_id)), [enrollments]);
  const availableStudents = useMemo(
    () => students.filter((s) => !enrolledStudentIds.has(s.id)),
    [students, enrolledStudentIds]
  );
  const studentsById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const coursesById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const prefilledStudentEnrolled = students.some((s) => s.id === studentId && enrolledStudentIds.has(s.id));

  function describeError(err, fallback) {
    if (err instanceof ApiError) {
      if (err.status === 409) return err.message || "That student is already enrolled in another course.";
      if (err.status === 404) return err.message || "Student or course not found.";
      if (err.status === 400) return err.message || "Please choose both a student and a course.";
      if (err.status === 403) return "Your session doesn't have admin access for this action.";
      return err.message;
    }
    return fallback;
  }

  async function handleEnroll(e) {
    e.preventDefault();
    if (!studentId || !courseId) return;
    setAction("enroll");
    setNotice(null);
    try {
      const enrollment = await enrollStudent({ studentId, courseId });
      const student = studentsById.get(studentId);
      const course = coursesById.get(courseId);
      setEnrollments((prev) => [
        {
          ...enrollment,
          student: { full_name: student?.full_name },
          course: { title: course?.title, is_published: course?.is_published },
        },
        ...prev,
      ]);
      setNotice({ type: "success", message: `${student?.full_name || "Student"} is now enrolled in "${course?.title || "course"}".` });
      setStudentId("");
    } catch (err) {
      setNotice({ type: "error", message: describeError(err, "Enrollment failed. Please try again.") });
    } finally {
      setAction(null);
    }
  }

  async function confirmUnenroll() {
    if (!pendingRemoval) return;
    setAction("unenroll");
    setNotice(null);
    try {
      await unenrollStudent({ studentId: pendingRemoval.student_id, courseId: pendingRemoval.course_id });
      setEnrollments((prev) => prev.filter((e) => e.id !== pendingRemoval.id));
      setNotice({
        type: "success",
        message: "Enrollment removed — that student can now be enrolled in a course again.",
      });
    } catch (err) {
      setNotice({ type: "error", message: describeError(err, "Couldn't remove that enrollment.") });
    } finally {
      setAction(null);
      setPendingRemoval(null);
    }
  }

  if (status === "loading") return <AdminLoadingState label="Loading students, courses and enrollments…" />;
  if (status === "error") return <AdminErrorState message={error} onRetry={load} />;

  const selectedCourse = courses.find((c) => c.id === courseId);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-400 dark:text-slate-500">
        Each student can only be enrolled in one course at a time — students who already have a course are listed below.
      </p>

      <AdminPanel className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <UserPlus className="h-4 w-4 text-brand-600 dark:text-brand-300" />
          Enroll a student
        </h2>

        {students.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="No students yet"
            description="Register students from the dashboard first."
          />
        ) : courses.length === 0 ? (
          <AdminEmptyState
            icon={GraduationCap}
            title="No courses yet"
            description="Create a course on the Courses page before enrolling anyone."
          />
        ) : availableStudents.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="Everyone is enrolled"
            description="All registered students are already in a course. Remove an enrollment below to free up a student."
          />
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleEnroll}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Student</label>
                <AdminSelect value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                  <option value="">Select an unenrolled student…</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </AdminSelect>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Course</label>
                <AdminSelect value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                  <option value="">Select a course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} — {c.instructor?.full_name || "Unassigned"} {c.is_published ? "" : "(Unpublished)"}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            </div>

            {prefilledStudentEnrolled && (
              <p className="rounded-lg bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-300">
                That student is already enrolled and was hidden from the picker. Remove their current enrollment below
                first.
              </p>
            )}

            {selectedCourse && !selectedCourse.is_published && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                This course is unpublished. Admin enrollment still works — students just can't self-enroll in it.
              </p>
            )}

            {notice && (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  notice.type === "error" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                }`}
              >
                {notice.message}
              </p>
            )}

            <div>
              <AdminButton type="submit" isLoading={action === "enroll"} loadingText="Enrolling…" disabled={!studentId || !courseId}>
                Enroll
              </AdminButton>
            </div>
          </form>
        )}
      </AdminPanel>

      <AdminPanel className="p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <GraduationCap className="h-4 w-4 text-brand-600 dark:text-brand-300" />
          Current enrollments
        </h2>

        {enrollments.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">No students are enrolled yet.</p>
        ) : (
          <dl className="divide-y divide-slate-100 dark:divide-ink-700">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <dt className="truncate font-medium text-slate-900 dark:text-slate-100">{e.student?.full_name || "Student"}</dt>
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                    {e.course?.title || "Course"} · enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge published={e.course?.is_published} />
                  <AdminButton
                    variant="danger"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setPendingRemoval(e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </AdminButton>
                </div>
              </div>
            ))}
          </dl>
        )}
      </AdminPanel>

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        title="Remove this enrollment?"
        description={
          pendingRemoval
            ? `${pendingRemoval.student?.full_name || "This student"} will be unenrolled from "${pendingRemoval.course?.title || "this course"}". They become available to enroll again.`
            : "This will remove the enrollment."
        }
        confirmLabel="Remove enrollment"
        onConfirm={confirmUnenroll}
        onCancel={() => setPendingRemoval(null)}
        isLoading={action === "unenroll"}
      />
    </div>
  );
}