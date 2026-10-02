import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/ui/Avatar";
import { AdminPanel } from "../../features/admin/components/AdminUi";

// Admin profiles are managed directly in the database (see README), not
// through a self-service form — this page is read-only by design.
export default function AdminSettings() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-5">
      <AdminPanel className="flex items-center gap-4 p-5">
        <Avatar name={profile?.full_name} src={profile?.avatar_url} size={56} />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{profile?.full_name}</p>
          <p className="text-xs uppercase tracking-wide text-brand-600 dark:text-brand-300">Administrator</p>
        </div>
      </AdminPanel>

      <AdminPanel className="p-5">
        <dl className="divide-y divide-slate-100 dark:divide-ink-700">
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-slate-400 dark:text-slate-500">Full name</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{profile?.full_name}</dd>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-slate-400 dark:text-slate-500">Role</dt>
            <dd className="font-medium capitalize text-slate-900 dark:text-slate-100">{profile?.role}</dd>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-slate-400 dark:text-slate-500">Admin ID</dt>
            <dd className="font-mono text-xs text-slate-600 dark:text-slate-300">{profile?.id}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Admin profiles are managed directly in the database — there's no self-service edit form for this role.
        </p>
      </AdminPanel>
    </div>
  );
}
