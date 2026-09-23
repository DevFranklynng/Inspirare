import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCourse, enrollInCourse } from "../api/courses";
import { completeLesson } from "../api/lessons";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import ModuleAccordion from "../components/courses/ModuleAccordion";
import { ArrowLeft, Layers } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const { isInstructor } = useAuth();

  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [notice, setNotice] = useState(null);

  // The course-detail endpoint doesn't report which lessons this student has
  // already completed, so we track completions made during this session
  // locally and mark them done optimistically as the student clicks through.
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [completingId, setCompletingId] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fetchCourse(id);
      setCourse(result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this course.");
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEnroll() {
    setEnrolling(true);
    setNotice(null);
    try {
      await enrollInCourse(id);
      setCourse((c) => ({ ...c, is_enrolled: true }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setCourse((c) => ({ ...c, is_enrolled: true }));
      } else {
        setNotice({ type: "error", message: err instanceof ApiError ? err.message : "Enrollment failed." });
      }
    } finally {
      setEnrolling(false);
    }
  }

  async function handleCompleteLesson(lessonId) {
    setCompletingId(lessonId);
    try {
      await completeLesson(lessonId);
      setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
    } catch (err) {
      setNotice({ type: "error", message: err instanceof ApiError ? err.message : "Couldn't mark that lesson complete." });
    } finally {
      setCompletingId(null);
    }
  }

  if (status === "loading") return <LoadingState label="Loading course…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  const canComplete = !isInstructor && course.is_enrolled !== false;

  return (
    <div className="flex flex-col gap-5">
      <Link to="/courses" className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
          {course.description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{course.description}</p>}
        </div>
        {!isInstructor && course.is_enrolled === false && (
          <Button isLoading={enrolling} loadingText="Enrolling…" onClick={handleEnroll} className="shrink-0">
            Enroll in this course
          </Button>
        )}
      </div>

      {notice && (
        <p className={`rounded-lg px-3 py-2 text-sm ${notice.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
          {notice.message}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-800">Modules</h2>
        {(!course.modules || course.modules.length === 0) ? (
          <EmptyState icon={Layers} title="No modules yet" description="Modules and lessons will appear here once added." />
        ) : (
          course.modules
            .slice()
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((module) => (
              <ModuleAccordion
                key={module.id}
                module={module}
                completedLessonIds={completedLessonIds}
                onCompleteLesson={handleCompleteLesson}
                completingId={completingId}
                canComplete={canComplete}
              />
            ))
        )}
      </div>
    </div>
  );
}
