import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards the /admin/* tree itself — not just the nav link. Runs nested
// inside RequireAuth, so by the time this renders `status` is already
// "authenticated"; the only thing left to check is the role.
export default function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
