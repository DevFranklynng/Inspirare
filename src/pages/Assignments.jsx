import { useCallback, useEffect, useState } from "react";
import { fetchDashboard } from "../api/dashboard";
import { submitAssignment } from "../api/assignments";
import { ApiError } from "../api/client";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import AssignmentCard from "../components/assignments/AssignmentCard";
import { ClipboardList } from "lucide-react";

// There's no "list assignments" endpoint for students in the current API —
// only submit-by-id and the dashboard's upcoming_assignments summary — so
// this page surfaces the assignments the dashboard already knows about.
export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [results, setResults] = useState({});

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const dashboard = await fetchDashboard();
      setAssignments(dashboard.upcoming_assignments || []);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your assignments.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(assignmentId, payload) {
    setSubmittingId(assignmentId);
    try {
      await submitAssignment(assignmentId, payload);
      setResults((r) => ({ ...r, [assignmentId]: { type: "success", message: "Submitted." } }));
    } catch (err) {
      setResults((r) => ({
        ...r,
        [assignmentId]: { type: "error", message: err instanceof ApiError ? err.message : "Submission failed." },
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  if (status === "loading") return <LoadingState label="Loading assignments…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Assignments</h1>
        <p className="text-sm text-slate-400">Upcoming work across your enrolled courses.</p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nothing due" description="Upcoming assignments will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onSubmit={handleSubmit}
              isSubmitting={submittingId === a.id}
              result={results[a.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
