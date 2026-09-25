import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, Pencil, ShieldAlert, XCircle } from "lucide-react";
import { fetchEvaluations, fetchEvaluation, reviewEvaluation } from "../../api/ai";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import { Field, TextInput, TextArea, Notice } from "../instructor/Field";
import { AiPill } from "./AiPrimitives";

/**
 * The AI grading review queue.
 *
 * An AI evaluation is only ever a *proposal*. Nothing here writes a grade:
 * accepting or editing is what creates the official `grades` row, and
 * rejecting keeps the proposal on record without touching student results.
 * Cases the AI flagged (low confidence, no rubric, injection attempts) are
 * surfaced first and never auto-accepted.
 */

const FLAG_COPY = {
  empty_submission: "Submission was empty",
  unparsable_attachment: "Only an attachment was submitted",
  insufficient_evidence: "Not enough evidence to judge",
  no_rubric: "No rubric on this assignment",
  low_confidence: "The AI wasn't confident",
  ambiguous: "Answer was ambiguous",
  unrelated_content: "Answer looks unrelated",
  criteria_discrepancy: "Rubric and scores disagreed",
  subjective_judgement: "Needed subjective judgement",
  possible_prompt_injection: "Possible prompt injection",
};

export default function AiGradingQueue({ courseId }) {
  const [evaluations, setEvaluations] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setEvaluations(await fetchEvaluations({ course_id: courseId, status: "pending" }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load the AI grading queue.");
      setEvaluations([]);
    }
  }, [courseId]);

  useEffect(() => {
    setEvaluations(null);
    setDetail(null);
    setSelectedId(null);
    if (courseId) load();
  }, [courseId, load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return undefined;
    }
    let cancelled = false;
    setDetail(null);
    fetchEvaluation(selectedId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setScore(data.evaluation.final_score ?? data.evaluation.proposed_score ?? "");
        setFeedback(data.evaluation.evaluation?.overallFeedback || "");
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Couldn't load that evaluation."));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const decide = async (action) => {
    setBusy(action);
    setError(null);
    setNotice(null);
    try {
      await reviewEvaluation(selectedId, {
        action,
        score: action === "edit" ? Number(score) : undefined,
        feedback: action === "edit" ? feedback : undefined,
      });
      setNotice(
        action === "reject"
          ? "Rejected — the AI proposal was kept for the record and no grade was recorded."
          : `Recorded — the student now has an official grade of ${score || detail.evaluation.proposed_score}.`
      );
      setDetail(null);
      setSelectedId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't record that decision.");
    } finally {
      setBusy(null);
    }
  };

  if (!courseId) {
    return <EmptyState icon={ClipboardCheck} title="Pick a course first" description="AI grading is always reviewed per course." />;
  }
  if (error && !evaluations) return <ErrorState message={error} onRetry={load} />;
  if (evaluations === null) return <LoadingState label="Loading AI evaluations…" />;

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <div>
        {evaluations.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Nothing waiting for review"
            description="Run the AI grader from a submission in your assignments list and the proposal will appear here."
          />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {evaluations.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(row.id);
                    setError(null);
                    setNotice(null);
                  }}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    row.id === selectedId
                      ? "border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10"
                      : "border-slate-200 hover:border-brand-200 dark:border-ink-700 dark:hover:border-ink-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {row.student?.full_name || "Student"}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {row.proposed_score}/{row.max_score}
                    </span>
                  </div>
                  {row.requires_review && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <ShieldAlert className="h-3 w-3" />
                      needs review
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {!detail ? (
          <EmptyState icon={ClipboardCheck} title="Select an evaluation" description="Compare the proposal with the actual submission, then accept, edit or reject it." />
        ) : (
          <>
            {notice && <Notice type="success">{notice}</Notice>}
            {error && <Notice>{error}</Notice>}

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {detail.assignment?.title}
              </h3>
              <AiPill kind="info">
                proposed {detail.evaluation.proposed_score}/{detail.evaluation.max_score}
              </AiPill>
              {detail.evaluation.requires_review && <AiPill kind="warn">needs review</AiPill>}
            </div>

            {Array.isArray(detail.evaluation.review_flags) && detail.evaluation.review_flags.length > 0 && (
              <div className="rounded-xl bg-amber-50/70 p-3 dark:bg-amber-950/30">
                <p className="mb-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Why the AI flagged this
                </p>
                <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700 dark:text-amber-400/90">
                  {detail.evaluation.review_flags.map((flag) => (
                    <li key={flag}>{FLAG_COPY[flag] || flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <section>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Student's submission
                </p>
                <div className="max-h-64 overflow-y-auto whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-ink-800 dark:text-slate-300">
                  {detail.submission?.content || "(no text submitted)"}
                </div>
              </section>

              <section>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  AI assessment
                </p>
                <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm dark:bg-ink-800">
                  {Array.isArray(detail.evaluation.evaluation?.criteria) &&
                    detail.evaluation.evaluation.criteria.map((criterion, i) => (
                      <div key={i}>
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {criterion.name} — {criterion.score}/{criterion.maxScore}
                        </p>
                        {criterion.feedback && (
                          <p className="text-slate-600 dark:text-slate-400">{criterion.feedback}</p>
                        )}
                      </div>
                    ))}
                  {detail.evaluation.evaluation?.overallFeedback && (
                    <p className="text-slate-700 dark:text-slate-300">
                      {detail.evaluation.evaluation.overallFeedback}
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
              <Field label={`Score / ${detail.evaluation.max_score}`}>
                <TextInput
                  type="number"
                  min="0"
                  max={detail.evaluation.max_score}
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              </Field>
              <Field label="Official feedback" hint="This is what the student sees. Edit it freely — the AI's original wording is preserved separately.">
                <TextArea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => decide("accept")} isLoading={busy === "accept"}>
                <CheckCircle2 className="h-4 w-4" />
                Accept AI grade
              </Button>
              <Button onClick={() => decide("edit")} isLoading={busy === "edit"} variant="secondary">
                <Pencil className="h-4 w-4" />
                Save my grade
              </Button>
              <Button
                onClick={() => decide("reject")}
                isLoading={busy === "reject"}
                variant="secondary"
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
