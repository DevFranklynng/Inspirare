import { useCallback, useEffect, useState } from "react";
import { fetchStudents, fetchAllCourses, enrollStudent, unenrollStudent } from "../api/admin";
import { ApiError } from "../api/client";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { Users, ShieldCheck } from "lucide-react";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-300";

export default function Admin() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [action, setAction] = useState(null); // "enroll" | "unenroll" | null
  const [notice, setNotice] = useState(null);

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

  async function handleEnroll(e) {
    e.preventDefault();
    if (!studentId || !courseId) return;
    setAction("enroll");
    setNotice(null);
    try {
      await enrollStudent({ studentId, courseId });
      setNotice({ type: "success", message: "Student enrolled." });
    } catch (err) {
      setNotice({ type: "error", message: err instanceof ApiError ? err.message : "Enrollment failed." });
    } finally {
      setAction(null);
    }
  }

  async function handleUnenroll(e) {
    e.preventDefault();
    if (!studentId || !courseId) return;
    setAction("unenroll");
    setNotice(null);
    try {
      await unenrollStudent({ studentId, courseId });
      setNotice({ type: "success", message: "Enrollment removed." });
    } catch (err) {
      setNotice({ type: "error", message: err instanceof ApiError ? err.message : "Couldn't remove enrollment." });
    } finally {
      setAction(null);
    }
  }

  if (status === "loading") return <LoadingState label="Loading students and courses…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin</h1>
        <p className="text-sm text-slate-400">Enroll students into courses.</p>
      </div>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          Manage enrollment
        </h2>

        {students.length === 0 || courses.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nothing to enroll yet"
            description={students.length === 0 ? "No students have registered yet." : "No courses have been created yet."}
          />
        ) : (
          <form className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Student</label>
              <select className={selectClass} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Select a student…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
              <select className={selectClass} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.instructor?.full_name || "Unassigned"} {c.is_published ? "" : "(Unpublished)"}
                  </option>
                ))}
              </select>
            </div>

            {notice && (
              <p className={`rounded-lg px-3 py-2 text-sm ${notice.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                {notice.message}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleEnroll}
                isLoading={action === "enroll"}
                loadingText="Enrolling…"
                disabled={!studentId || !courseId}
              >
                Enroll
              </Button>
              <Button
                variant="secondary"
                onClick={handleUnenroll}
                isLoading={action === "unenroll"}
                loadingText="Removing…"
                disabled={!studentId || !courseId}
              >
                Remove enrollment
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">All courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-400">No courses yet.</p>
        ) : (
          <dl className="divide-y divide-slate-100">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <dt className="font-medium text-slate-700">{c.title}</dt>
                  <p className="text-xs text-slate-400">{c.instructor?.full_name || "Unassigned"}</p>
                </div>
                <dd
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    c.is_published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {c.is_published ? "Published" : "Unpublished"}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </div>
  );
}
