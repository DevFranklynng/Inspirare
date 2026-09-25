import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function MustChangePasswordGate() {
  const { profile, status } = useAuth();
  const location = useLocation();

  if (status !== "authenticated") return <Outlet />;
  if (!profile?.must_change_password) return <Outlet />;
  if (location.pathname === "/change-password") return <Outlet />;

  return <Navigate to="/change-password" replace />;
}

export default MustChangePasswordGate;
