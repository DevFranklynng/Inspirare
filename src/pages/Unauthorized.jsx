import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../components/ui/Button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50 px-4 text-center dark:bg-ink-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">You don't have permission to access this area.</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This section is restricted.</p>
      </div>
      <Link to="/dashboard">
        <Button>Back to your dashboard</Button>
      </Link>
    </div>
  );
}
