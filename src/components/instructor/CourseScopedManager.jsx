import { useCallback, useEffect, useState } from "react";
import { fetchCourses } from "../../api/courses";
import { ApiError } from "../../api/client";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { Select } from "./Field";
import { BookOpen } from "lucide-react";

// Same pattern for the /assignments, /schedule and /materials pages when the
// user is an instructor: pick one of their courses, then render that
// course's management panel underneath.

export default function CourseScopedManager({ title, subtitle, renderManager, emptyCopy }) {
  const [courses, setCourses] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const rows = await fetchCourses();
      setCourses(rows);
      if (rows.length > 0) setCourseId((prev) => prev || rows[0].id);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your courses.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, attempt]);

  if (status === "loading") return <LoadingState label="Loading courses…" />;
  if (status === "error") return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">{subtitle}</p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description={emptyCopy || "Once you have a course assigned, open it from Courses to manage it."}
        />
      ) : (
        <>
          <div className="flex flex-col gap-1.5 sm:w-80">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</span>
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>
          {courseId && renderManager(courseId)}
        </>
      )}
    </div>
  );
}