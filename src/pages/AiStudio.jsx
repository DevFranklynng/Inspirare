import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardCheck, FileEdit, Sparkles } from "lucide-react";
import { fetchCourses } from "../api/courses";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { Select } from "../components/instructor/Field";
import { AiProviderChip, AiUnavailableBanner } from "../components/ai/AiPrimitives";
import { useAiStatus } from "../components/ai/useAiStatus";
import AiGeneratorPanel from "../components/ai/AiGeneratorPanel";
import AiDraftReview from "../components/ai/AiDraftReview";
import AiGradingQueue from "../components/ai/AiGradingQueue";

/**
 * The instructor's AI workspace.
 *
 * Three jobs, deliberately kept as separate tabs so the review/publish step is
 * never a side effect of generating something:
 *   Create  — generate a draft
 *   Drafts  — review, edit, approve, publish
 *   Grading — accept, edit or reject AI grade proposals
 *
 * The course selector is the scope for all three: the backend refuses any
 * course the signed-in instructor doesn't own.
 */

const TABS = [
  { id: "create", label: "Create", icon: Sparkles },
  { id: "drafts", label: "Drafts", icon: FileEdit },
  { id: "grading", label: "Grading", icon: ClipboardCheck },
];

export default function AiStudio() {
  const { isInstructor } = useAuth();
  const navigate = useNavigate();
  const { status } = useAiStatus();

  const [courses, setCourses] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [tab, setTab] = useState("create");
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isInstructor) navigate("/dashboard", { replace: true });
  }, [isInstructor, navigate]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await fetchCourses();
      setCourses(rows);
      setCourseId((prev) => prev || rows[0]?.id || "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your courses.");
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, attempt]);

  if (!isInstructor) return null;
  if (error && !courses) return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;
  if (courses === null) return <LoadingState label="Loading your courses…" />;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            <BookOpen className="h-6 w-6 text-brand-600" />
            AI Sub-Instructor
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Draft lectures, materials, assignments and quizzes — then review every one before it reaches
            your students.
          </p>
        </div>
        <AiProviderChip status={status} />
      </header>

      <AiUnavailableBanner status={status} />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="You don't have a course yet"
          description="Create a course first — AI drafts always belong to a course you own."
          action={<Button onClick={() => navigate("/courses")}>Go to Courses</Button>}
        />
      ) : (
        <>
          <div className="flex flex-col gap-1.5 sm:w-96">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</span>
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                  tab === id
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-brand-50 dark:bg-ink-800 dark:text-slate-300 dark:hover:bg-ink-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* key forces the drafts/grading panels to refetch after a change. */}
          <div key={`${tab}-${courseId}-${refreshKey}`}>
            {tab === "create" && (
              <AiGeneratorPanel
                courseId={courseId}
                status={status}
                onGenerated={() => setRefreshKey((k) => k + 1)}
              />
            )}
            {tab === "drafts" && (
              <AiDraftReview
                courseId={courseId}
                onPublished={() => {
                  setRefreshKey((k) => k + 1);
                  setTab("drafts");
                }}
              />
            )}
            {tab === "grading" && <AiGradingQueue courseId={courseId} />}
          </div>
        </>
      )}
    </div>
  );
}
