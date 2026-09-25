import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageSquare, Plus, CornerDownRight, User, ShieldCheck } from "lucide-react";
import { listThreads, createThread, createReply } from "../api/forum";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import SectionErrorBoundary from "../components/ui/SectionErrorBoundary";

/**
 * Shared student + instructor forum.
 *
 * The backend policy keeps this an academic-only space: admins get a 403 from
 * the server before they ever reach this page, and the app-area gate routes
 * them to their own admin area (see App.jsx's BlockAdminFromAppArea). So both
 * nav lists here lead students and instructors into one living discussion —
 * threads are loosely course-scoped (a course_id scopes a thread to that
 * course's forum; a null one is a general "water cooler" thread).
 */
export default function Forum() {
  const { profile } = useAuth();
  const isInstructor = profile?.role === "instructor";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forum</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Discuss courses, ask questions and share notes with classmates and instructors.
          </p>
        </div>
        <Button type="button" onClick={() => document.getElementById("new-thread-title")?.focus()}>
          New thread
        </Button>
      </div>

      <SectionErrorBoundary>
        <ThreadList isInstructor={isInstructor} />
      </SectionErrorBoundary>
    </div>
  );
}

function ThreadList({ isInstructor }) {
  const [searchParams] = useSearchParams();
  const courseFilter = searchParams.get("course_id") || undefined;

  const [threads, setThreads] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseId, setCourseId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await listThreads({ courseId: courseFilter });
      setThreads(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the forum.");
      setStatus("error");
    }
  }, [courseFilter]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <LoadingState label="Loading the forum…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  async function handleCreateThread(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const thread = await createThread({ title, body, courseId: courseId || undefined });
      setTitle("");
      setBody("");
      setCourseId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the thread.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <form onSubmit={handleCreateThread} className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title"
              aria-label="Thread title"
              required
              className="w-64"
            />
            <Input
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Optional course ID"
              aria-label="Optional course ID"
              className="w-52"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Starting…" : "Start thread"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>
      </Card>

      {threads.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No threads here yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Be the first to start a discussion in the shared forum.
            </p>
          </div>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {threads.map((t) => (
            <li key={t.id}>
              <Link to={`/forum/${t.id}`}>
                <Card className="p-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t.title}</h3>
                      <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-slate-500">
                        {t.reply_count} {t.reply_count === 1 ? "reply" : "replies"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{t.body}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t.author_name}
                      <span className="mx-1">·</span>
                      {t.course_id ? "Course-scoped" : "General"}
                      <span className="mx-1">·</span>
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
