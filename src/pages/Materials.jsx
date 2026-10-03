import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderOpen, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboard } from "../api/dashboard";
import { fetchCourseMaterials } from "../api/materials";
import { ApiError } from "../api/client";
import CourseScopedManager from "../components/instructor/CourseScopedManager";
import MaterialsManager from "../components/instructor/MaterialsManager";
import MaterialItem from "../components/materials/MaterialItem";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState("all");
  const [hasEnrolledCourse, setHasEnrolledCourse] = useState(true);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const dashboard = await fetchDashboard();
      const enrolledCourses = dashboard.enrolled_courses || [];
      setHasEnrolledCourse(enrolledCourses.length > 0);
      setCourses(enrolledCourses.map((c) => ({ id: c.course_id, title: c.title })));

      // Dedicated per-course endpoint, since the dashboard's embedded
      // materials omit created_at, which this page displays.
      const perCourse = await Promise.all(
        enrolledCourses.map(async (c) => {
          const courseMaterials = await fetchCourseMaterials(c.course_id);
          return (courseMaterials || []).map((m) => ({ ...m, course_id: c.course_id, course_title: c.title }));
        })
      );

      const merged = perCourse.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setMaterials(merged);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your materials.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleMaterials = useMemo(
    () => (activeCourseId === "all" ? materials : materials.filter((m) => m.course_id === activeCourseId)),
    [materials, activeCourseId]
  );

  if (status === "loading") return <LoadingState label="Loading your materials…" variant="material" count={4} />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  if (!hasEnrolledCourse) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Materials</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">Your course materials will show up here.</p>
        </div>
        <EmptyState icon={BookOpen} title="You're not enrolled in a course yet" description="An administrator enrolls you in a course. Once they have, your materials show up here." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Materials</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">Files, links and notes shared across your enrolled courses.</p>
      </div>

      {courses.length > 1 && (
        <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 shadow-soft dark:border-ink-700 dark:bg-ink-900">
          <button
            onClick={() => setActiveCourseId("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeCourseId === "all"
                ? "bg-brand-600 text-white shadow-pop"
                : "text-slate-500 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-brand-300"
            }`}
          >
            All courses
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCourseId(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeCourseId === c.id
                  ? "bg-brand-600 text-white shadow-pop"
                  : "text-slate-500 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-brand-300"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {visibleMaterials.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No course materials yet" description="Files, links and notes your instructor shares will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visibleMaterials.map((m) => (
            <MaterialItem key={m.id} material={m} courseTitle={courses.length > 1 ? m.course_title : null} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Materials() {
  const { isInstructor } = useAuth();

  if (isInstructor) {
    return (
      <CourseScopedManager
        title="Materials"
        subtitle="Drop files, links and notes for your students across courses."
        renderManager={(courseId) => <MaterialsManager key={courseId} courseId={courseId} />}
        emptyCopy="Once you have a course assigned, open it from Courses to manage it."
      />
    );
  }

  return <StudentMaterials />;
}
