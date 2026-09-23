import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const explicitRedirect = location.state?.from;

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!form.email) errors.email = "Enter your email address.";
    if (!form.password) errors.password = "Enter your password.";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFormError(null);
    setIsSubmitting(true);
    try {
      const me = await login(form);
      // Honor a deep link the user was trying to reach before being sent to
      // /login; otherwise route by role — admins land on /admin, everyone
      // else on /dashboard.
      const redirectTo = explicitRedirect || (me.role === "admin" ? "/admin" : "/dashboard");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormError("Invalid email or password.");
      } else if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("We couldn't connect to Inspirare right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="E-mail address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={update("email")}
        error={fieldErrors.email}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={form.password}
        onChange={update("password")}
        error={fieldErrors.password}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-300" />
          Remember me
        </label>
        <a href="#" className="font-medium text-brand-600 hover:text-brand-700">
          Forgot password?
        </a>
      </div>

      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} loadingText="Signing in…" className="mt-2 w-full">
        Sign In
      </Button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account? Contact your administrator — accounts are created for you.
      </p>
    </form>
  );
}
