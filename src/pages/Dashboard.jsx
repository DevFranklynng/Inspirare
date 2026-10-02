import { useCallback, useEffect, useState } from "react";
import { fetchDashboard } from "../api/dashboard";
import { fetchMyAttendance } from "../api/sessions";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import QuickLinksCard from "../components/dashboard/QuickLinksCard";
import ProgressCard from "../components/dashboard/ProgressCard";
import UpcomingAssignments from "../components/dashboard/UpcomingAssignments";
import PerformanceCard from "../components/dashboard/PerformanceCard";
import UpcomingClasses from "../components/dashboard/UpcomingClasses";
import RecentMaterials from "../components/dashboard/RecentMaterials";
import InstructorSummary from "../components/dashboard/InstructorSummary";
import Card from "../components/ui/Card";
import { Link } from "react-router-dom";

// Student / instructor dashboard only — admins are routed to their own
// dashboard at /admin (see BlockAdminFromAppArea in App.jsx) with real
// platform-wide stats, rather than getting a branch bolted on here.
export default function Dashboard() {
  const { profile, isInstructor } = useAuth();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fetchDashboard();
      let attendanceSummary = null;
      const enrolledCourses = result.enrolled_courses || [];
      if (!isInstructor && enrolledCourses.length > 0) {
        const attendanceResults = await Promise.allSettled(
          enrolledCourses.map((course) => fetchMyAttendance(course.course_id))
        );
        if (attendanceResults.every((item) => item.status === "fulfilled")) {
          const summaries = attendanceResults.map((item) => item.value.summary);
          const present = summaries.reduce((sum, summary) => sum + (summary.present || 0), 0);
          const absent = summaries.reduce((sum, summary) => sum + (summary.absent || 0), 0);
          const marked = present + absent;
          attendanceSummary = {
            present,
            absent,
            marked,
            unmarked: summaries.reduce((sum, summary) => sum + (summary.unmarked || 0), 0),
            is_marked: marked > 0,
            attendance_percent: marked ? Math.round((present / marked) * 100) : 0,
          };
        }
      }
      setData({ ...result, attendance_summary: attendanceSummary });
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your dashboard.");
      setStatus("error");
    }
  }, [isInstructor]);

  useEffect(() => {
    load();
  }, [load]);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  if (status === "loading") return <LoadingState label="Loading your dashboard…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="dashboard-grid flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-5">
          <WelcomeCard
            name={firstName}
            subtitle={
              isInstructor
                ? "Here's how your courses are doing."
                : "Here's where your courses and assignments stand."
            }
          />
        </div>
        <div className="lg:col-span-7"><QuickLinksCard isInstructor={isInstructor} /></div>
      </div>

      {isInstructor ? (
        <>
          <InstructorSummary data={data} />
          <Card className="dashboard-panel">
            <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Your courses</h2>
            {(!data.courses || data.courses.length === 0) ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No courses assigned to you yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-slate-100 dark:divide-ink-700">
                {data.courses.map((c) => (
                  <li key={c.course_id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link to={`/courses/${c.course_id}`} className="truncate text-sm font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300">
                        {c.title}
                      </Link>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {c.enrolled_students ?? 0} students · {c.pending_submissions ?? 0} pending submissions
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        c.is_published
                          ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                          : "bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-300"
                      }`}
                    >
                      {c.is_published ? "Published" : "Draft"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-12">
            <ProgressCard
              courses={data.enrolled_courses}
              academicStanding={data.academic_standing}
              attendance={data.attendance_summary}
            />
          </div>
          <div className="lg:col-span-5"><PerformanceCard grade={data.recent_grade} /></div>
          <div className="lg:col-span-7">
            <UpcomingAssignments assignments={data.upcoming_assignments} />
          </div>
        </div>
      )}

      {!isInstructor && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-5"><UpcomingClasses courses={data.enrolled_courses} /></div>
          <div className="lg:col-span-7"><RecentMaterials courses={data.enrolled_courses} /></div>
        </div>
      )}
    </div>
  );
}
