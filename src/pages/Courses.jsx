import { useCallback, useEffect, useState } from "react";
import { fetchCourses, enrollInCourse } from "../api/courses";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import CourseCard from "../components/courses/CourseCard";
import { BookOpen } from "lucide-react";

export default function Courses() {
  const { isInstructor } = useAuth();
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fetchCourses();
      setCourses(result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load courses.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEnroll(courseId) {
    setEnrollingId(courseId);
    setNotice(null);
    try {
      await enrollInCourse(courseId);
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, is_enrolled: true } : c)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, is_enrolled: true } : c)));
      } else if (err instanceof ApiError) {
        setNotice({ type: "error", message: err.message });
      } else {
        setNotice({ type: "error", message: "We couldn't connect to Inspirare right now. Please try again." });
      }
    } finally {
      setEnrollingId(null);
    }
  }

  if (status === "loading") return <LoadingState label="Loading courses…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{isInstructor ? "Your courses" : "Courses"}</h1>
        <p className="text-sm text-slate-400">
          {isInstructor ? "Courses you've created." : "Browse published courses and track your enrollment."}
        </p>
      </div>

      {notice && (
        <p className={`rounded-lg px-3 py-2 text-sm ${notice.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
          {notice.message}
        </p>
      )}

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={isInstructor ? "No courses yet" : "No published courses yet"}
          description={isInstructor ? "Courses you create will show up here." : "Check back soon — new courses will appear here."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onEnroll={handleEnroll} enrolling={enrollingId === course.id} />
          ))}
        </div>
      )}
    </div>
  );
}
