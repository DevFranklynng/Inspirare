import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../features/admin/components/AdminSidebar";
import AdminHeader from "../features/admin/components/AdminHeader";

const titles = {
  "/admin": "Dashboard",
  "/admin/users": "Users",
  "/admin/students": "Students",
  "/admin/courses": "Courses",
  "/admin/enrollments": "Enrollments",
  "/admin/settings": "Settings",
};

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || "Admin";

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div className="hidden border-r border-ink-600/60 md:block">
          <AdminSidebar />
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0">
              <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader title={title} onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
