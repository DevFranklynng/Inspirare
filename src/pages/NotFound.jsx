import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-brand-50 px-4 text-center dark:bg-ink-950">
      <p className="text-5xl font-extrabold text-brand-600">404</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">This page doesn't exist.</p>
      <Link to="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
