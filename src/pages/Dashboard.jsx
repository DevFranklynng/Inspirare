import { useCallback, useEffect, useState } from "react";
import { fetchDashboard } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import ProgressCard from "../components/dashboard/ProgressCard";
import UpcomingAssignments from "../components/dashboard/UpcomingAssignments";
import PerformanceCard from "../components/dashboard/PerformanceCard";
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
      setData(result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your dashboard.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  if (status === "loading") return <LoadingState label="Loading your dashboard…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <WelcomeCard
        name={firstName}
        subtitle={
          isInstructor
            ? "Here's how your courses are doing."
            : "Here's where your courses and assignments stand."
        }
      />

      {isInstructor ? (
        <>
          <InstructorSummary data={data} />
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-800">Your courses</h2>
            {(!data.courses || data.courses.length === 0) ? (
              <p className="text-sm text-slate-400">You haven't created any courses yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-slate-100">
                {data.courses.map((c) => (
                  <li key={c.course_id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link to={`/courses/${c.course_id}`} className="truncate text-sm font-medium text-slate-800 hover:text-brand-600">
                        {c.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {c.enrolled_students ?? 0} students · {c.pending_submissions ?? 0} pending submissions
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        c.is_published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProgressCard courses={data.enrolled_courses} />
          </div>
          <PerformanceCard grade={data.recent_grade} />
          <div className="lg:col-span-2">
            <UpcomingAssignments assignments={data.upcoming_assignments} />
          </div>
        </div>
      )}
    </div>
  );
}
