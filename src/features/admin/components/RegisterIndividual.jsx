import { useState } from "react";
import { UserPlus, Copy, Check, KeyRound } from "lucide-react";
import { registerProfile } from "../../../api/admin";
import { ApiError } from "../../../api/client";
import { AdminPanel, AdminSelect, AdminButton } from "./AdminUi";

// Generates a shareable, unambiguous-by-default password (no 0/O, 1/l/I).
function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(text);
        setCopied(ok);
        if (ok) setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-ink-600 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-ink-800"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-500/30";

export default function RegisterIndividual({ onRegistered }) {
  const [form, setForm] = useState({ fullName: "", email: "", role: "student" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState(null);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
      setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
    };
  }

  function validate() {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Enter the person's full name.";
    if (!form.email.trim()) errors.email = "Enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    setIsSubmitting(true);
    const password = generatePassword();
    try {
      const user = await registerProfile({
        email: form.email.trim(),
        password,
        fullName: form.fullName.trim(),
        role: form.role,
      });
      setCredentials({ email: user.email || form.email.trim(), password, role: form.role });
      setForm({ fullName: "", email: "", role: "student" });
      if (onRegistered) onRegistered(user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 409
            ? "An account with that email already exists."
            : err.message
        );
      } else {
        setError("We couldn't connect to Inspirare right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminPanel className="p-5">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        <UserPlus className="h-4 w-4 text-brand-600 dark:text-brand-300" />
        Register an individual
      </h2>
      <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
        Create an account for someone. The password is generated for you — pass the printed credentials on to them.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Full name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={update("fullName")}
              placeholder="Enter their name"
              className={inputClass}
            />
            {fieldErrors.fullName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.fullName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">E-mail address</label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className={inputClass}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>}
          </div>
        </div>

        <div className="sm:w-1/2">
          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Role</label>
          <AdminSelect value={form.role} onChange={update("role")}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Administrator</option>
          </AdminSelect>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <AdminButton type="submit" isLoading={isSubmitting} loadingText="Creating account…">
            Create account
          </AdminButton>
          {credentials && (
            <AdminButton variant="ghost" type="button" onClick={() => setCredentials(null)}>
              Clear
            </AdminButton>
          )}
        </div>
      </form>

      {credentials && (
        <div className="mt-5 rounded-xl border border-brand-200 dark:border-brand-500/30 bg-brand-50/60 dark:bg-brand-500/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            <KeyRound className="h-4 w-4" />
            Account created — share these credentials
          </div>
          <dl className="divide-y divide-slate-100 dark:divide-ink-700 text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-400 dark:text-slate-500">Role</dt>
              <dd className="font-medium capitalize text-slate-900 dark:text-slate-100">{credentials.role}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-400 dark:text-slate-500">E-mail</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-slate-900 dark:text-slate-100">{credentials.email}</span>
                <CopyButton text={credentials.email} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-400 dark:text-slate-500">Password</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-slate-900 dark:text-slate-100">{credentials.password}</span>
                <CopyButton text={credentials.password} />
              </dd>
            </div>
          </dl>
        </div>
      )}
    </AdminPanel>
  );
}