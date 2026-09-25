import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Users, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { fetchCourseSessions, fetchSessionAttendance, markAttendance } from "../../api/sessions";
import { fetchCourseStudents } from "../../api/courses";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import Avatar from "../ui/Avatar";
import { Select, Notice } from "./Field";

// Take attendance for a session: pick which class, then tap each student
// present/absent. Saving upserts the full roster snapshot for that session.

function RosterRow({ student, status, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-ink-700 dark:bg-ink-900">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={student.full_name} src={student.avatar_url} size={32} />
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{student.full_name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onToggle(student.id, "present")}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            status === "present"
              ? "bg-green-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/40 dark:hover:text-green-400"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Present
        </button>
        <button
          onClick={() => onToggle(student.id, "absent")}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            status === "absent"
              ? "bg-red-600 text-white shadow-sm"
              : "text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          }`}
        >
          <XCircle className="h-3.5 w-3.5" /> Absent
        </button>
      </div>
    </div>
  );
}

export default function AttendanceManager({ courseId }) {
  const [students, setStudents] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [roster, setRoster] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const onError = (message, successMessage) => {
    setError(message || null);
    setNotice(successMessage || null);
  };

  useEffect(() => {
    (async () => {
      setStatus("loading");
      setError(null);
      try {
        const [studentRows, sessionRows] = await Promise.all([
          fetchCourseStudents(courseId),
          fetchCourseSessions(courseId),
        ]);
        setStudents(studentRows);
        setSessions(sessionRows);
        setStatus("success");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't load attendance data.");
        setStatus("error");
      }
    })();
  }, [courseId, attempt]);

  useEffect(() => {
    if (!selectedSessionId) return;
    (async () => {
      setLoadingAttendance(true);
      setError(null);
      try {
        const existing = await fetchSessionAttendance(selectedSessionId);
        const map = {};
        for (const s of students || []) {
          map[s.id] = "present";
        }
        for (const rec of existing || []) {
          map[rec.student_id] = rec.status;
        }
        setRoster(map);
      } catch (err) {
        onError(err instanceof ApiError ? err.message : "Couldn't load that session's attendance.");
      } finally {
        setLoadingAttendance(false);
      }
    })();
  }, [selectedSessionId]);

  const presentCount = useMemo(
    () => Object.values(roster).filter((s) => s === "present").length,
    [roster]
  );

  function setAllPresent() {
    const next = {};
    for (const s of students || []) next[s.id] = "present";
    setRoster(next);
  }

  async function save() {
    if (!selectedSessionId) return;
    const records = (students || []).map((s) => ({
      student_id: s.id,
      status: roster[s.id] === "absent" ? "absent" : "present",
    }));
    setSaving(true);
    try {
      await markAttendance(selectedSessionId, records);
      setNotice(`Attendance saved for ${presentCount}/${records.length} present.`);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't save attendance.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <LoadingState label="Loading roster…" />;
  if (status === "error") return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;

  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No enrolled students"
        description="Once students enroll in this course, you can take attendance for each scheduled session."
      />
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No sessions scheduled"
        description="Schedule a class session first, then come back here to take attendance for it."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:w-80">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Session</span>
          <Select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
            <option value="">Select a session…</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — {new Date(s.starts_at).toLocaleString()}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="px-3 py-2 text-xs" onClick={setAllPresent} disabled={!selectedSessionId}>
            Mark all present
          </Button>
          <Button isLoading={saving} loadingText="Saving…" onClick={save} disabled={!selectedSessionId}>
            <ClipboardCheck className="h-4 w-4" /> Save attendance
          </Button>
        </div>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {notice && <Notice type="success">{notice}</Notice>}

      {selectedSessionId ? (
        loadingAttendance ? (
          <LoadingState label="Loading attendance…" />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {presentCount}/{students.length} currently marked present
            </p>
            {students.map((student) => (
              <RosterRow
                key={student.id}
                student={student}
                status={roster[student.id] || "present"}
                onToggle={(studentId, val) => setRoster((prev) => ({ ...prev, [studentId]: val }))}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="Pick a session"
          description="Select a session above to start marking who attended."
        />
      )}
    </div>
  );
}