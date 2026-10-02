import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";
import { fetchStudents, fetchEnrollments } from "../../api/admin";
import { ApiError } from "../../api/client";
import DataTable from "../../features/admin/components/DataTable";
import {
  SearchInput,
  AdminButton,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from "../../features/admin/components/AdminUi";

const columns = [
  { key: "name", label: "Student" },
  { key: "id", label: "Student ID" },
  { key: "enrollment", label: "Enrollment" },
  { key: "actions", label: "Actions" },
];

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [studentsData, enrollmentsData] = await Promise.all([fetchStudents(), fetchEnrollments()]);
      setStudents(studentsData);
      setEnrollments(enrollmentsData);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load students.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const enrollmentByStudent = useMemo(() => {
    const map = {};
    for (const e of enrollments) {
      if (!map[e.student_id]) map[e.student_id] = e;
    }
    return map;
  }, [enrollments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.full_name?.toLowerCase().includes(q));
  }, [students, query]);

  if (status === "loading") return <AdminLoadingState label="Loading students…" />;
  if (status === "error") return <AdminErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400 dark:text-slate-500">{students.length} registered student{students.length === 1 ? "" : "s"}</p>
        <SearchInput value={query} onChange={setQuery} placeholder="Search students…" className="sm:w-72" />
      </div>

      {students.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No students yet"
          description="Register students from the admin dashboard — they'll appear here."
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={Users} title="No matches" description={`No students match "${query}".`} />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(s) => s.id}
          renderCell={(s, key) => {
            if (key === "name") return <span className="font-medium text-slate-900 dark:text-slate-100">{s.full_name}</span>;
            if (key === "id") return <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{s.id}</span>;
            if (key === "enrollment") {
              const e = enrollmentByStudent[s.id];
              if (!e) return <span className="text-xs text-slate-400 dark:text-slate-500">Not enrolled</span>;
              return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/15 px-2.5 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {e.course?.title || "Enrolled"}
                </span>
              );
            }
            if (key === "actions")
              return (
                <AdminButton
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => navigate(`/admin/enrollments?studentId=${s.id}`)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {enrollmentByStudent[s.id] ? "Manage" : "Enroll"}
                </AdminButton>
              );
            return null;
          }}
        />
      )}
    </div>
  );
}