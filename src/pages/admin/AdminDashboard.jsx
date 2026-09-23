import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, CheckCircle2, EyeOff, UserPlus, GraduationCap } from "lucide-react";
import { fetchDashboard } from "../../api/dashboard";
import { fetchAllCourses } from "../../api/admin";
import { ApiError } from "../../api/client";
import RegisterIndividual from "../../features/admin/components/RegisterIndividual";
import {
  AdminPanel,
  StatCard,
  StatusBadge,
  AdminLoadingState,
  AdminErrorState,
  AdminButton,
} from "../../features/admin/components/AdminUi";

// Total students/instructors/courses/enrollments come from the real
// admin-aware GET /dashboard aggregate. Published/unpublished and "recent
// courses" aren't in that aggregate, so they're derived from
// GET /admin/courses, per the brief's "derive from the documented admin
// endpoints" fallback.
export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [summaryData, coursesData] = await Promise.all([fetchDashboard(), fetchAllCourses()]);
      setSummary(summaryData);
      setCourses(coursesData);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the admin dashboard.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <AdminLoadingState label="Loading platform overview…" />;
  if (status === "error") return <AdminErrorState message={error} onRetry={load} />;

  const publishedCount = courses.filter((c) => c.is_published).length;
  const unpublishedCount = courses.length - publishedCount;
  const recentCourses = courses.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total students" value={summary.total_students ?? 0} />
        <StatCard icon={GraduationCap} label="Total instructors" value={summary.total_instructors ?? 0} />
        <StatCard icon={BookOpen} label="Total courses" value={summary.total_courses ?? courses.length} />
        <StatCard icon={UserPlus} label="Total enrollments" value={summary.total_enrollments ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={CheckCircle2} label="Published courses" value={publishedCount} />
        <StatCard icon={EyeOff} label="Unpublished courses" value={unpublishedCount} />
      </div>

      <AdminPanel className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent courses</h2>
          <Link to="/admin/courses" className="text-xs font-semibold text-gold-400 hover:text-gold-300">
            View all
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <p className="text-sm text-ink-300">No courses created yet.</p>
        ) : (
          <ul className="divide-y divide-ink-600/40">
            {recentCourses.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{c.title}</p>
                  <p className="text-xs text-ink-300">{c.instructor?.full_name || "Unassigned"}</p>
                </div>
                <StatusBadge published={c.is_published} />
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/enrollments">
          <AdminButton>
            <UserPlus className="h-4 w-4" />
            Enroll a student
          </AdminButton>
        </Link>
        <Link to="/admin/students">
          <AdminButton variant="secondary">View students</AdminButton>
        </Link>
        <Link to="/admin/courses">
          <AdminButton variant="secondary">View courses</AdminButton>
        </Link>
      </div>

      <RegisterIndividual />
    </div>
  );
}
