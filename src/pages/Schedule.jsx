import { CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CourseScopedManager from "../components/instructor/CourseScopedManager";
import ScheduleManager from "../components/instructor/ScheduleManager";
import EmptyState from "../components/ui/EmptyState";

// Instructors schedule and edit their live classes here. Students don't have
// a schedule endpoint yet, so they still see the "coming soon" placeholder —
// the sidebar nav exists per the brief, but nothing pretends the feature is
// wired up for them.
export default function Schedule() {
  const { isInstructor } = useAuth();

  if (isInstructor) {
    return (
      <CourseScopedManager
        title="Schedule"
        subtitle="Schedule and manage live classes across your courses."
        renderManager={(courseId) => <ScheduleManager key={courseId} courseId={courseId} />}
        emptyCopy="Once you have a course assigned, open it from Courses to manage it."
      />
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <EmptyState
        icon={CalendarDays}
        title="Schedule"
        description="Your class schedule will live here once the API supports it."
      />
    </div>
  );
}