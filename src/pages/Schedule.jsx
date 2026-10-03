import { useCallback, useEffect, useState } from "react";
import { CalendarDays, BookOpen, History } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboard } from "../api/dashboard";
import { fetchCourseSessions } from "../api/sessions";
import { ApiError } from "../api/client";
import CourseScopedManager from "../components/instructor/CourseScopedManager";
import ScheduleManager from "../components/instructor/ScheduleManager";
import SessionRow from "../components/schedule/SessionRow";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getSessionStatus } from "../utils/datetime";

function StudentSchedule() {
  const [sessions, setSessions] = useState([]);
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

      // Dedicated per-course endpoint, since the dashboard's embedded
      // sessions omit the description field this page shows.
      const perCourse = await Promise.all(
        enrolledCourses.map(async (c) => {
          const courseSessions = await fetchCourseSessions(c.course_id);
          return (courseSessions || []).map((s) => ({ ...s, course_title: c.title }));
        })
      );

      const merged = perCourse.flat().sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
      setSessions(merged);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your schedule.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <LoadingState label="Loading your schedule…" variant="session" count={3} />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  if (!hasEnrolledCourse) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Schedule</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">Your live classes will show up here.</p>
        </div>
        <EmptyState icon={BookOpen} title="You're not enrolled in a course yet" description="An administrator enrolls you in a course. Once they have, your class schedule shows up here." />
      </div>
    );
  }

  const upcoming = sessions.filter((s) => getSessionStatus(s.starts_at, s.ends_at) !== "past");
  const past = sessions
    .filter((s) => getSessionStatus(s.starts_at, s.ends_at) === "past")
    .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Schedule</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">Live classes across your enrolled courses.</p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No classes scheduled yet" description="Your instructor hasn't scheduled any live sessions yet." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upcoming</h2>
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Nothing upcoming" description="You're all caught up — new classes will appear here." />
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((s) => (
                  <SessionRow key={s.id} session={s} courseTitle={s.course_title} />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <History className="h-4 w-4" /> Past
              </h2>
              <div className="flex flex-col gap-3">
                {past.map((s) => (
                  <SessionRow key={s.id} session={s} courseTitle={s.course_title} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Schedule() {
  const { isInstructor } = useAuth();

  if (isInstructor) {
    return (
      <CourseScopedManager
        title="Schedule"
        subtitle="Schedule and manage live classes across your courses."
        renderManager={(courseId) => <ScheduleManager key={courseId} courseId={courseId} />}
        emptyCopy="Once you have a course assigned, open it from Courses to manage it."
      />
    );
  }

  return <StudentSchedule />;
}
