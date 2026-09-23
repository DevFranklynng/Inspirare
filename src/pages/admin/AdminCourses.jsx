import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, UserPlus } from "lucide-react";
import { fetchAllCourses } from "../../api/admin";
import { ApiError } from "../../api/client";
import DataTable from "../../features/admin/components/DataTable";
import {
  SearchInput,
  AdminSelect,
  AdminButton,
  StatusBadge,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from "../../features/admin/components/AdminUi";

const columns = [
  { key: "title", label: "Course" },
  { key: "instructor", label: "Instructor" },
  { key: "status", label: "Status" },
  { key: "id", label: "Course ID" },
  { key: "actions", label: "Actions" },
];

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [publishFilter, setPublishFilter] = useState("all"); // all | published | unpublished

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchAllCourses();
      setCourses(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load courses.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesQuery = !q || c.title?.toLowerCase().includes(q) || c.instructor?.full_name?.toLowerCase().includes(q);
      const matchesPublish =
        publishFilter === "all" ||
        (publishFilter === "published" && c.is_published) ||
        (publishFilter === "unpublished" && !c.is_published);
      return matchesQuery && matchesPublish;
    });
  }, [courses, query, publishFilter]);

  if (status === "loading") return <AdminLoadingState label="Loading courses…" />;
  if (status === "error") return <AdminErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-300">{courses.length} course{courses.length === 1 ? "" : "s"} total</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Search title or instructor…" className="sm:w-64" />
          <AdminSelect value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="sm:w-44">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </AdminSelect>
        </div>
      </div>

      {courses.length === 0 ? (
        <AdminEmptyState icon={BookOpen} title="No courses yet" description="Courses created by instructors will show up here." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={BookOpen} title="No matches" description="Try a different search or filter." />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(c) => c.id}
          renderCell={(c, key) => {
            if (key === "title") return <span className="font-medium text-white">{c.title}</span>;
            if (key === "instructor") return c.instructor?.full_name || <span className="text-ink-400">Unassigned</span>;
            if (key === "status") return <StatusBadge published={c.is_published} />;
            if (key === "id") return <span className="font-mono text-xs text-ink-300">{c.id}</span>;
            if (key === "actions")
              return (
                <AdminButton
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => navigate(`/admin/enrollments?courseId=${c.id}`)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Enroll student
                </AdminButton>
              );
            return null;
          }}
        />
      )}
    </div>
  );
}
