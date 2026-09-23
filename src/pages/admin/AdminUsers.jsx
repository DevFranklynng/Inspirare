import { useCallback, useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { fetchUsers, updateUserRole } from "../../api/admin";
import { ApiError } from "../../api/client";
import DataTable from "../../features/admin/components/DataTable";
import {
  SearchInput,
  AdminSelect,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
  ConfirmDialog,
} from "../../features/admin/components/AdminUi";

const ROLE_DEFS = {
  student: "bg-ink-600 text-ink-100",
  instructor: "bg-brand-500/15 text-brand-300",
  admin: "bg-gold-400/10 text-gold-300",
};

function RoleBadge({ role }) {
  const classes = ROLE_DEFS[role] || ROLE_DEFS.student;
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {role}
    </span>
  );
}

const columns = [
  { key: "name", label: "User" },
  { key: "role", label: "Role" },
  { key: "created", label: "Created" },
  { key: "actions", label: "Change role" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const [pendingChange, setPendingChange] = useState(null); // { user, role }
  const [notice, setNotice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load users.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.full_name?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q));
  }, [users, query]);

  async function confirmRoleChange() {
    if (!pendingChange) return;
    setIsSaving(true);
    setNotice(null);
    try {
      await updateUserRole({ userId: pendingChange.user.id, role: pendingChange.role });
      setUsers((prev) =>
        prev.map((u) => (u.id === pendingChange.user.id ? { ...u, role: pendingChange.role } : u))
      );
      setNotice({ type: "success", message: `${pendingChange.user.full_name} is now ${pendingChange.role}.` });
    } catch (err) {
      setNotice({
        type: "error",
        message:
          err instanceof ApiError ? err.message : "Couldn't update that user's role. Please try again.",
      });
    } finally {
      setIsSaving(false);
      setPendingChange(null);
    }
  }

  if (status === "loading") return <AdminLoadingState label="Loading users…" />;
  if (status === "error") return <AdminErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-300">{users.length} account{users.length === 1 ? "" : "s"}</p>
        <SearchInput value={query} onChange={setQuery} placeholder="Search name or role…" className="sm:w-72" />
      </div>

      {notice && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            notice.type === "error" ? "bg-red-950/40 text-red-300" : "bg-gold-400/10 text-gold-300"
          }`}
        >
          {notice.message}
        </p>
      )}

      {users.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No users yet"
          description="Accounts appear here once someone has an account."
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={Users} title="No matches" description={`No users match "${query}".`} />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(u) => u.id}
          renderCell={(u, key) => {
            if (key === "name") return <span className="font-medium text-white">{u.full_name}</span>;
            if (key === "role") return <RoleBadge role={u.role} />;
            if (key === "created")
              return (
                <span className="text-xs text-ink-300">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              );
            if (key === "actions")
              return (
                <AdminSelect
                  value={u.role}
                  onChange={(e) => setPendingChange({ user: u, role: e.target.value })}
                  className="w-40 py-1.5 text-xs"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </AdminSelect>
              );
            return null;
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingChange)}
        title="Change this user's role?"
        description={
          pendingChange
            ? `${pendingChange.user.full_name} will move from "${pendingChange.user.role}" to "${pendingChange.role}".`
            : ""
        }
        confirmLabel="Change role"
        onConfirm={confirmRoleChange}
        onCancel={() => setPendingChange(null)}
        isLoading={isSaving}
      />
    </div>
  );
}