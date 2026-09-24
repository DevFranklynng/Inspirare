import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import Landing from "./Landing";

// Sends "/" to the right place: admins to /admin, everyone else to
// /dashboard, and shows the public landing page to signed-out visitors.
export default function RoleHome() {
  const { status, isAdmin } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  if (status === "unauthenticated") return <Landing />;

  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
}
