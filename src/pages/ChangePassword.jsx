import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ChangePassword() {
  const { profile, status, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  if (status === "loading") return null;
  if (status !== "authenticated") return <Navigate to="/login" replace />;

  const mustChange = Boolean(profile?.must_change_password);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword({ password });
      setPassword("");
      setConfirm("");
      navigate(mustChange ? "/dashboard" : "/settings", { replace: true });
    } catch (err) {
      setError(err?.message || "Could not change your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full justify-center py-8">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {mustChange ? "Choose a new password" : "Change password"}
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {mustChange
            ? "Your account was created by an administrator. Set your own password to continue using Inspirare."
            : "Pick a new password for your account."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" isLoading={saving} loadingText="Saving…" className="w-full">
            Update password
          </Button>

          {!mustChange && (
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Back to settings
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={logout}
          className="mt-6 text-sm font-medium text-slate-400 hover:text-red-600 dark:hover:text-red-400"
        >
          Log out
        </button>
      </Card>
    </div>
  );
}
