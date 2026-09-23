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
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-500 px-2.5 py-1.5 text-xs font-semibold text-ink-100 transition-colors hover:bg-ink-700"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-gold-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-ink-300 outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20";

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
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
        <UserPlus className="h-4 w-4 text-gold-400" />
        Register an individual
      </h2>
      <p className="mb-4 text-xs text-ink-300">
        Create an account for someone. The password is generated for you — pass the printed credentials on to them.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">Full name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={update("fullName")}
              placeholder="Enter their name"
              className={inputClass}
            />
            {fieldErrors.fullName && <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-200">E-mail address</label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className={inputClass}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
          </div>
        </div>

        <div className="sm:w-1/2">
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Role</label>
          <AdminSelect value={form.role} onChange={update("role")}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Administrator</option>
          </AdminSelect>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300">
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
        <div className="mt-5 rounded-xl border border-gold-400/30 bg-gold-400/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-300">
            <KeyRound className="h-4 w-4" />
            Account created — share these credentials
          </div>
          <dl className="divide-y divide-ink-600/40 text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-ink-300">Role</dt>
              <dd className="font-medium capitalize text-white">{credentials.role}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-ink-300">E-mail</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-white">{credentials.email}</span>
                <CopyButton text={credentials.email} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-ink-300">Password</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-white">{credentials.password}</span>
                <CopyButton text={credentials.password} />
              </dd>
            </div>
          </dl>
        </div>
      )}
    </AdminPanel>
  );
}