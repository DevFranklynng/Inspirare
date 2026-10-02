import { Outlet, useLocation } from "react-router-dom";
import AppShell from "../components/layout/AppShell";

const pages = {
  "/admin": { title: "Dashboard", subtitle: "Platform overview and quick actions." },
  "/admin/users": { title: "Users", subtitle: "Manage accounts and their roles." },
  "/admin/students": { title: "Students", subtitle: "Everyone registered as a student." },
  "/admin/courses": { title: "Courses", subtitle: "Create, publish and assign courses." },
  "/admin/enrollments": { title: "Enrollments", subtitle: "Enroll students into courses." },
  "/admin/settings": { title: "Settings", subtitle: "Your administrator profile." },
};

// The admin area now uses the same AppShell as the student/instructor app, so
// it gets the same sidebar, topbar and mobile bar. The page heading that used
// to sit in the old black header is rendered here instead, in the same style
// the student pages use for their own <h1>.
export default function AdminLayout() {
  const { pathname } = useLocation();
  const page = pages[pathname] || { title: "Admin" };

  return (
    <AppShell>
      <div className="mb-5 lg:mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{page.title}</h1>
        {page.subtitle && (
          <p className="text-sm text-slate-400 dark:text-slate-500">{page.subtitle}</p>
        )}
      </div>
      <Outlet />
    </AppShell>
  );
}
