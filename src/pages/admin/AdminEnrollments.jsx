import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UserPlus, Users } from "lucide-react";
import { fetchStudents, fetchAllCourses, enrollStudent, unenrollStudent } from "../../api/admin";
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
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [studentId, setStudentId] = useState(searchParams.get("studentId") || "");
  const [courseId, setCourseId] = useState(searchParams.get("courseId") || "");
  const [action, setAction] = useState(null); // "enroll" | "unenroll" | null
  const [notice, setNotice] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [studentsData, coursesData] = await Promise.all([fetchStudents(), fetchAllCourses()]);
      setStudents(studentsData);
      setCourses(coursesData);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load students and courses.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function describeError(err, fallback) {
    if (err instanceof ApiError) {
      if (err.status === 409) return "This student is already enrolled in that course.";
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
      await enrollStudent({ studentId, courseId });
      setNotice({ type: "success", message: "Student enrolled." });
    } catch (err) {
      setNotice({ type: "error", message: describeError(err, "Enrollment failed. Please try again.") });
    } finally {
      setAction(null);
    }
  }

  async function confirmUnenroll() {
    setAction("unenroll");
    setNotice(null);
    try {
      await unenrollStudent({ studentId, courseId });
      setNotice({ type: "success", message: "Enrollment removed." });
    } catch (err) {
      setNotice({ type: "error", message: describeError(err, "Couldn't remove that enrollment.") });
    } finally {
      setAction(null);
      setConfirmOpen(false);
    }
  }

  if (status === "loading") return <AdminLoadingState label="Loading students and courses…" />;
  if (status === "error") return <AdminErrorState message={error} onRetry={load} />;

  const selectedStudent = students.find((s) => s.id === studentId);
  const selectedCourse = courses.find((c) => c.id === courseId);

  return (
    <div className="flex flex-col gap-5">
      <AdminPanel className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <UserPlus className="h-4 w-4 text-gold-400" />
          Manage enrollment
        </h2>

        {students.length === 0 || courses.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="Nothing to enroll yet"
            description={students.length === 0 ? "No students have registered yet." : "No courses have been created yet."}
          />
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleEnroll}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-200">Student</label>
              <AdminSelect value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Select a student…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </AdminSelect>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-200">Course</label>
              <AdminSelect value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.instructor?.full_name || "Unassigned"} {c.is_published ? "" : "(Unpublished)"}
                  </option>
                ))}
              </AdminSelect>
            </div>

            {selectedCourse && !selectedCourse.is_published && (
              <p className="rounded-lg bg-gold-400/10 px-3 py-2 text-xs text-gold-300">
                This course is unpublished. Admin enrollment still works — students self-enrolling would be blocked, but a
                deliberate admin placement isn't.
              </p>
            )}

            {notice && (
              <p className={`rounded-lg px-3 py-2 text-sm ${notice.type === "error" ? "bg-red-950/40 text-red-300" : "bg-gold-400/10 text-gold-300"}`}>
                {notice.message}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <AdminButton type="submit" isLoading={action === "enroll"} loadingText="Enrolling…" disabled={!studentId || !courseId}>
                Enroll
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                onClick={() => setConfirmOpen(true)}
                disabled={!studentId || !courseId}
              >
                Remove enrollment
              </AdminButton>
            </div>
          </form>
        )}
      </AdminPanel>

      <AdminPanel className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">All courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-ink-300">No courses yet.</p>
        ) : (
          <dl className="divide-y divide-ink-600/40">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <dt className="truncate font-medium text-white">{c.title}</dt>
                  <p className="truncate text-xs text-ink-300">{c.instructor?.full_name || "Unassigned"}</p>
                </div>
                <StatusBadge published={c.is_published} />
              </div>
            ))}
          </dl>
        )}
      </AdminPanel>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove this enrollment?"
        description={
          selectedStudent && selectedCourse
            ? `${selectedStudent.full_name} will be unenrolled from "${selectedCourse.title}".`
            : "This will unenroll the selected student from the selected course."
        }
        confirmLabel="Remove enrollment"
        onConfirm={confirmUnenroll}
        onCancel={() => setConfirmOpen(false)}
        isLoading={action === "unenroll"}
      />
    </div>
  );
}
