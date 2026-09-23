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

export default function Dashboard() {
  const { profile, isInstructor, isAdmin } = useAuth();
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
          isAdmin
            ? "Here's the current state of the platform."
            : isInstructor
            ? "Here's how your courses are doing."
            : "Here's where your courses and assignments stand."
        }
      />

      {isAdmin ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Students", value: data.total_students },
            { label: "Instructors", value: data.total_instructors },
            { label: "Courses", value: data.total_courses },
            { label: "Enrollments", value: data.total_enrollments },
          ].map((stat) => (
            <Card key={stat.label} className="flex flex-col gap-1">
              <p className="text-2xl font-bold text-slate-900">{stat.value ?? 0}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </Card>
          ))}
        </div>
      ) : isInstructor ? (
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
