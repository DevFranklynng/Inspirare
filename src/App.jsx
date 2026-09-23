import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CalendarDays, FolderOpen, MessageSquare } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RedirectIfAuthenticated } from "./components/auth/AuthGuard";
import AppLayout from "./components/layout/AppLayout";
import SectionErrorBoundary from "./components/ui/SectionErrorBoundary";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Assignments from "./pages/Assignments";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

function withBoundary(element) {
  return <SectionErrorBoundary>{element}</SectionErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={withBoundary(<Dashboard />)} />
              <Route path="/courses" element={withBoundary(<Courses />)} />
              <Route path="/courses/:id" element={withBoundary(<CourseDetail />)} />
              <Route path="/assignments" element={withBoundary(<Assignments />)} />
              <Route
                path="/schedule"
                element={<Placeholder icon={CalendarDays} title="Schedule" description="Your class schedule will live here once the API supports it." />}
              />
              <Route
                path="/materials"
                element={<Placeholder icon={FolderOpen} title="Materials" description="Downloadable course materials will live here." />}
              />
              <Route
                path="/forum"
                element={<Placeholder icon={MessageSquare} title="Forum" description="Course discussion will live here." />}
              />
              <Route path="/assessments" element={<Navigate to="/assignments" replace />} />
              <Route path="/settings" element={withBoundary(<Settings />)} />
              <Route path="/admin" element={withBoundary(<Admin />)} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
