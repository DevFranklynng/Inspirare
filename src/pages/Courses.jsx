import { useCallback, useEffect, useState } from "react";
import { fetchCourses } from "../api/courses";
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

  if (status === "loading") return <LoadingState label="Loading courses…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{isInstructor ? "Your courses" : "Courses"}</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {isInstructor
            ? "Courses you've created."
            : "An administrator enrolls you in a course — you'll see it here once that happens."}
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={isInstructor ? "No courses yet" : "You're not enrolled in any courses"}
          description={
            isInstructor
              ? "Courses assigned to you will show up here."
              : "Courses you are enrolled in appear here. Ask your administrator to enroll you."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
