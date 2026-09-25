import { FolderOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CourseScopedManager from "../components/instructor/CourseScopedManager";
import MaterialsManager from "../components/instructor/MaterialsManager";
import EmptyState from "../components/ui/EmptyState";

// Instructors drop files, links and notes for a course here. Students don't
// have a materials endpoint yet, so they keep the "coming soon" placeholder.
export default function Materials() {
  const { isInstructor } = useAuth();

  if (isInstructor) {
    return (
      <CourseScopedManager
        title="Materials"
        subtitle="Drop files, links and notes for your students across courses."
        renderManager={(courseId) => <MaterialsManager key={courseId} courseId={courseId} />}
        emptyCopy="Once you have a course assigned, open it from Courses to manage it."
      />
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <EmptyState
        icon={FolderOpen}
        title="Materials"
        description="Downloadable course materials will live here."
      />
    </div>
  );
}