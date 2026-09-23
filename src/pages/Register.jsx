import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
  return (
    <AuthLayout formTitle="Create your account" formSubtitle="Start tracking your courses and progress.">
      <RegisterForm />
    </AuthLayout>
  );
}
