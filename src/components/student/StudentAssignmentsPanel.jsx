import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Lock } from "lucide-react";
import { fetchCourseAssignments } from "../../api/courses";
import { submitAssignment } from "../../api/assignments";
import { ApiError } from "../../api/client";
import AssignmentCard from "../assignments/AssignmentCard";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

export default function StudentAssignmentsPanel({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | locked
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [results, setResults] = useState({});

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchCourseAssignments(courseId);
      setAssignments(data || []);
      setStatus("success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setStatus("locked");
        return;
      }
      setError(err instanceof ApiError ? err.message : "We couldn't load this course's assignments.");
      setStatus("error");
    }
  }, [courseId]);

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

  if (status === "loading") return <LoadingState label="Loading assignments…" variant="assignment" count={2} />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  if (status === "locked") {
    return (
      <EmptyState
        icon={Lock}
        title="Not enrolled in this course"
        description="Assignments are only visible to students an administrator has enrolled. Ask your administrator to enroll you."
      />
    );
  }

  if (assignments.length === 0) {
    return <EmptyState icon={ClipboardList} title="No assignments yet" description="Assignments your instructor posts will show up here." />;
  }

  return (
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
  );
}
