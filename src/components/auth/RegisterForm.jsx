import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { AuthSwitchLink } from "./AuthLayout";

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field) {
    return (e) =>
      setForm((f) => ({
        ...f,
        [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));
  }

  function validate() {
    const errors = {};
    if (!form.fullName) errors.fullName = "Enter your full name.";
    if (!form.email) errors.email = "Enter your email address.";
    if (!form.password) errors.password = "Choose a password.";
    else if (form.password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords don't match.";
    if (!form.agreed) errors.agreed = "You must agree to the Terms & Conditions.";
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
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: "student",
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
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
        label="Full name"
        autoComplete="name"
        placeholder="Enter your name"
        value={form.fullName}
        onChange={update("fullName")}
        error={fieldErrors.fullName}
      />
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
        autoComplete="new-password"
        placeholder="Enter your password"
        value={form.password}
        onChange={update("password")}
        error={fieldErrors.password}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        onChange={update("confirmPassword")}
        error={fieldErrors.confirmPassword}
      />

      <div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={update("agreed")}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-300"
          />
          By signing up, I agree with{" "}
          <a href="#" className="font-medium text-brand-600 hover:text-brand-700">
            Terms &amp; Conditions
          </a>
        </label>
        {fieldErrors.agreed && <p className="mt-1 text-xs text-red-600">{fieldErrors.agreed}</p>}
      </div>

      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} loadingText="Creating account…" className="mt-2 w-full">
        Sign Up
      </Button>

      <AuthSwitchLink prompt="Already have an account?" linkLabel="Sign in" to="/login" />
    </form>
  );
}
