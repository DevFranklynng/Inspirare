import { Outlet } from "react-router-dom";
import AppShell from "./AppShell";

// Student / instructor layout. Navigation (desktop rail, mobile bar) and the
// light/dark class are handled by AppShell, which the admin layout shares.
export default function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
