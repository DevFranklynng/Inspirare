import EmptyState from "../components/ui/EmptyState";

// Generic "coming soon" page for sidebar destinations the current API
// doesn't back yet (Schedule, Materials, Forum, Assessments). The nav item
// exists per the brief, but nothing here pretends the feature is wired up.
export default function Placeholder({ icon, title, description }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}
