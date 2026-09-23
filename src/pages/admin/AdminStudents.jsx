import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";
import { fetchStudents } from "../../api/admin";
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
  { key: "actions", label: "Actions" },
];

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchStudents();
      setStudents(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load students.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        <p className="text-sm text-ink-300">{students.length} registered student{students.length === 1 ? "" : "s"}</p>
        <SearchInput value={query} onChange={setQuery} placeholder="Search students…" className="sm:w-72" />
      </div>

      {students.length === 0 ? (
        <AdminEmptyState icon={Users} title="No students yet" description="Students will appear here once they register." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={Users} title="No matches" description={`No students match "${query}".`} />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(s) => s.id}
          renderCell={(s, key) => {
            if (key === "name") return <span className="font-medium text-white">{s.full_name}</span>;
            if (key === "id") return <span className="font-mono text-xs text-ink-300">{s.id}</span>;
            if (key === "actions")
              return (
                <AdminButton
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => navigate(`/admin/enrollments?studentId=${s.id}`)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Enroll
                </AdminButton>
              );
            return null;
          }}
        />
      )}
    </div>
  );
}
