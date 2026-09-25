import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Lock } from "lucide-react";
import { fetchCourseSessions } from "../../api/sessions";
import { ApiError } from "../../api/client";
import SessionRow from "../schedule/SessionRow";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

export default function StudentSchedulePanel({ courseId, onEnroll, enrolling }) {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | locked
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchCourseSessions(courseId);
      setSessions(data || []);
      setStatus("success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setStatus("locked");
        return;
      }
      setError(err instanceof ApiError ? err.message : "We couldn't load this course's schedule.");
      setStatus("error");
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <LoadingState label="Loading schedule…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  if (status === "locked") {
    return (
      <EmptyState
        icon={Lock}
        title="Enroll to see the schedule"
        description="Class sessions are only visible to students enrolled in this course."
        action={onEnroll && <Button isLoading={enrolling} loadingText="Enrolling…" onClick={onEnroll}>Enroll in this course</Button>}
      />
    );
  }

  if (sessions.length === 0) {
    return <EmptyState icon={CalendarDays} title="No classes scheduled yet" description="Your instructor hasn't scheduled any live sessions yet." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} />
      ))}
    </div>
  );
}
