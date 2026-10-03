import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RedirectIfAuthenticated } from "./components/auth/AuthGuard";
import BlockAdminFromAppArea from "./components/auth/BlockAdminFromAppArea";
import AdminRoute from "./routes/AdminRoute";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import SectionErrorBoundary from "./components/ui/SectionErrorBoundary";
import { MustChangePasswordGate } from "./components/auth/MustChangePasswordGate";

import RoleHome from "./pages/RoleHome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Assignments from "./pages/Assignments";
import Schedule from "./pages/Schedule";
import Materials from "./pages/Materials";
import Notifications from "./pages/Notifications";
import Forum from "./pages/Forum";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminSettings from "./pages/admin/AdminSettings";

function withBoundary(element) {
  return <SectionErrorBoundary>{element}</SectionErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RoleHome />} />

          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student / instructor app */}
            <Route element={<BlockAdminFromAppArea />}>
              {/* Forced-password gate: while must_change_password is set, the
                  user can reach only /change-password (below). Everything else
                  redirects there. This is the client-side half of the same
                  policy the API enforces via passwordGate middleware. */}
              <Route element={<MustChangePasswordGate />}>
                <Route path="/change-password" element={<ChangePassword />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={withBoundary(<Dashboard />)} />
                  <Route path="/courses" element={withBoundary(<Courses />)} />
                  <Route path="/courses/:id" element={withBoundary(<CourseDetail />)} />
                  <Route path="/assignments" element={withBoundary(<Assignments />)} />
                  <Route path="/schedule" element={withBoundary(<Schedule />)} />
                  <Route path="/materials" element={withBoundary(<Materials />)} />
                  <Route path="/forum" element={withBoundary(<Forum />)} />
                  <Route path="/notifications" element={withBoundary(<Notifications />)} />
                  <Route path="/assessments" element={<Navigate to="/assignments" replace />} />
                  <Route path="/settings" element={withBoundary(<Settings />)} />
                </Route>
              </Route>
            </Route>

            {/* Admin */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={withBoundary(<AdminDashboard />)} />
                <Route path="/admin/users" element={withBoundary(<AdminUsers />)} />
                <Route path="/admin/students" element={withBoundary(<AdminStudents />)} />
                <Route path="/admin/courses" element={withBoundary(<AdminCourses />)} />
                <Route path="/admin/enrollments" element={withBoundary(<AdminEnrollments />)} />
                <Route path="/admin/settings" element={withBoundary(<AdminSettings />)} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </BrowserRouter>
  );
}
