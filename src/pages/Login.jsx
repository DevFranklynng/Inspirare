import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    <AuthLayout formTitle="Welcome back" formSubtitle="Sign in to continue to Inspirare.">
      <LoginForm />
    </AuthLayout>
  );
}
