import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, UserPlus, Plus, Eye, EyeOff, X } from "lucide-react";
import { fetchAllCourses, fetchInstructors, createCourse, updateCourse } from "../../api/admin";
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

const fieldClass =
  "w-full rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-500/30";

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [publishFilter, setPublishFilter] = useState("all"); // all | published | unpublished

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", instructorId: "" });
  const [createErrors, setCreateErrors] = useState({});
  const [createNotice, setCreateNotice] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  // Per-row instructor reassignment. Backend PATCH /admin/courses/:id already
  // accepts instructor_id, so this just wires a control into the existing row.
  const [reassigningId, setReassigningId] = useState(null);
  const [reassignForm, setReassignForm] = useState({ instructorId: "" });
  const [reassignErrors, setReassignErrors] = useState({});
  const [reassignNotice, setReassignNotice] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);

  const openReassign = useCallback(
    (course) => {
      setReassigningId(course.id);
      setReassignForm({ instructorId: course.instructor_id || "" });
      setReassignErrors({});
      setReassignNotice(null);
    },
    []
  );

  async function handleReassignCourse(e) {
    e.preventDefault();
    if (isReassigning) return;

    if (!reassignForm.instructorId) {
      setReassignErrors({ instructorId: "Choose the instructor for this course." });
      return;
    }

    setReassignNotice(null);
    setIsReassigning(true);
    try {
      await updateCourse(reassigningId, { instructor_id: reassignForm.instructorId });
      setReassignNotice({ type: "success", message: "Instructor updated." });
      setReassigningId(null);
      load();
    } catch (err) {
      setReassignNotice({
        type: "error",
        message: err instanceof ApiError ? err.message : "Couldn't update the instructor. Please try again.",
      });
    } finally {
      setIsReassigning(false);
    }
  }

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [coursesData, instructorsData] = await Promise.all([fetchAllCourses(), fetchInstructors()]);
      setCourses(coursesData);
      setInstructors(instructorsData);
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

  function openCreate() {
    setShowCreate(true);
    setCreateForm({ title: "", description: "", instructorId: "" });
    setCreateErrors({});
    setCreateNotice(null);
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (isCreating) return;

    const errors = {};
    if (!createForm.title.trim()) errors.title = "Enter a course title.";
    if (!createForm.instructorId) errors.instructorId = "Choose the instructor who owns this course.";
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreateNotice(null);
    setIsCreating(true);
    try {
      await createCourse({
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        instructorId: createForm.instructorId,
      });
      setCreateNotice({ type: "success", message: "Course created." });
      setShowCreate(false);
      load();
    } catch (err) {
      setCreateNotice({
        type: "error",
        message: err instanceof ApiError ? err.message : "Couldn't create the course. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleTogglePublish(course) {
    setPublishingId(course.id);
    try {
      await updateCourse(course.id, { is_published: !course.is_published });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, is_published: !course.is_published } : c))
      );
    } catch (err) {
      setCreateNotice({
        type: "error",
        message: err instanceof ApiError ? err.message : "Couldn't update the course status.",
      });
    } finally {
      setPublishingId(null);
    }
  }

  if (status === "loading") return <AdminLoadingState label="Loading courses…" />;
  if (status === "error") return <AdminErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400 dark:text-slate-500">{courses.length} course{courses.length === 1 ? "" : "s"} total</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Search title or instructor…" className="sm:w-64" />
          <AdminSelect value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="sm:w-44">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </AdminSelect>
          <AdminButton onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New course
          </AdminButton>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-2xl border border-slate-100 dark:border-ink-700 bg-white dark:bg-ink-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Plus className="h-4 w-4 text-brand-600 dark:text-brand-300" />
              Create a course
            </h2>
            <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-ink-800" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {instructors.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No instructors yet. Promote someone to instructor on the <button onClick={() => navigate("/admin/users")} className="font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200">Users</button> page, then create a course.
            </p>
          ) : (
            <form onSubmit={handleCreateCourse} noValidate className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => {
                      setCreateForm((f) => ({ ...f, title: e.target.value }));
                      setCreateErrors((fe) => ({ ...fe, title: undefined }));
                    }}
                    placeholder="e.g. Advanced Web Development"
                    className={fieldClass}
                  />
                  {createErrors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createErrors.title}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Instructor</label>
                  <AdminSelect
                    value={createForm.instructorId}
                    onChange={(e) => {
                      setCreateForm((f) => ({ ...f, instructorId: e.target.value }));
                      setCreateErrors((fe) => ({ ...fe, instructorId: undefined }));
                    }}
                  >
                    <option value="">Select an instructor…</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.full_name}
                      </option>
                    ))}
                  </AdminSelect>
                  {createErrors.instructorId && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createErrors.instructorId}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Optional short description…"
                  className={fieldClass}
                />
              </div>

              {createNotice && (
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    createNotice.type === "error" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  }`}
                >
                  {createNotice.message}
                </p>
              )}

              <div className="flex gap-3">
                <AdminButton type="submit" isLoading={isCreating} loadingText="Creating…">
                  Create course
                </AdminButton>
                <AdminButton variant="secondary" type="button" onClick={() => setShowCreate(false)}>
                  Cancel
                </AdminButton>
              </div>
            </form>
          )}
        </div>
      )}

      {courses.length === 0 ? (
        <AdminEmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create the first course, or wait for instructors to add theirs."
          action={
            <AdminButton variant="secondary" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New course
            </AdminButton>
          }
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={BookOpen} title="No matches" description="Try a different search or filter." />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(c) => c.id}
          renderCell={(c, key) => {
            if (key === "title") return <span className="font-medium text-slate-900 dark:text-slate-100">{c.title}</span>;
            if (key === "instructor") return c.instructor?.full_name || <span className="text-slate-400 dark:text-slate-500">Unassigned</span>;
            if (key === "status") return <StatusBadge published={c.is_published} />;
            if (key === "id") return <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{c.id}</span>;
            if (key === "actions")
              return (
                <div className="flex flex-wrap items-center gap-2">
                  <AdminButton
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => navigate(`/admin/enrollments?courseId=${c.id}`)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Enroll student
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    isLoading={publishingId === c.id}
                    loadingText="Saving…"
                    onClick={() => handleTogglePublish(c)}
                  >
                    {c.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {c.is_published ? "Unpublish" : "Publish"}
                  </AdminButton>
                </div>
              );
            return null;
          }}
        />
      )}
    </div>
  );
}