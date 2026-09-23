import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// The student/instructor app (AppLayout + its routes) isn't meant for
// admins — their real home is /admin. Keeps the two areas cleanly
// separated in both directions (see AdminRoute for the reverse guard).
export default function BlockAdminFromAppArea() {
  const { isAdmin } = useAuth();

  if (isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
}
