import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  ClipboardList,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  generateLecture,
  generateMaterial,
  generateAssignment,
  generateQuiz,
} from "../../api/ai";
import { fetchCourse } from "../../api/courses";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import { Field, TextInput, TextArea, Select, Notice } from "../instructor/Field";
import { AiWorking, AiContentPreview, AiDraftNotice, AiPill } from "./AiPrimitives";

/**
 * The four instructor generators, behind one form shell.
 *
 * All of them follow the same contract: describe what you want → get a
 * structured draft → review it in the Drafts tab. Nothing here writes to
 * course content directly; publishing is a separate, deliberate step.
 */

const TABS = [
  { id: "lecture", label: "Lecture", icon: BookOpen },
  { id: "material", label: "Material", icon: FileText },
  { id: "assignment", label: "Assignment", icon: ClipboardList },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
];

const MATERIAL_TYPES = [
  "study_guide",
  "summary",
  "flashcards",
  "mcqs",
  "short_answer",
  "revision_notes",
  "practical_exercises",
  "glossary",
];

const DIFFICULTIES = ["introductory", "intermediate", "advanced"];
const QUESTION_TYPES = ["mcq", "true_false", "short_answer"];
const ASSIGNMENT_TYPES = ["problem_set", "project", "lab", "essay", "case_study"];

export default function AiGeneratorPanel({ courseId, status, onGenerated }) {
  const [kind, setKind] = useState("lecture");
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Lessons give the model real course context instead of a cold start.
  const lessons = useMemo(() => {
    const modules = course?.modules || [];
    return modules.flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        id: lesson.id,
        label: `${module.title} › ${lesson.title}`,
      }))
    );
  }, [course]);

  useEffect(() => {
    let cancelled = false;
    setCourse(null);
    if (!courseId) return undefined;
    fetchCourse(courseId)
      .then((data) => !cancelled && setCourse(data))
      .catch(() => !cancelled && setCourse(null));
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Reset per-generator form state when the generator or course changes so
  // values never leak between generators.
  useEffect(() => {
    setForm({ lessonId: "", difficulty: "intermediate" });
    setResult(null);
    setError(null);
  }, [kind, courseId]);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = useCallback(async () => {
    setError(null);
    setResult(null);
    setBusy(true);

    const lessonId = form.lessonId || undefined;
    const instructions = form.instructions?.trim() || undefined;

    try {
      let payload;
      if (kind === "lecture") {
        payload = {
          courseId,
          lessonId,
          topic: form.topic?.trim(),
          level: form.level || "undergraduate",
          duration: form.duration || 45,
          difficulty: form.difficulty,
          instructions,
        };
        if (!payload.topic) throw new ApiError("Give the lecture a topic first.", 400);
        setResult(await generateLecture(payload));
      } else if (kind === "material") {
        payload = { courseId, lessonId, materialType: form.materialType || "study_guide", instructions };
        setResult(await generateMaterial(payload));
      } else if (kind === "assignment") {
        payload = {
          courseId,
          lessonId,
          difficulty: form.difficulty,
          assignmentType: form.assignmentType || "problem_set",
          taskCount: Number(form.taskCount) || 3,
          totalMarks: Number(form.totalMarks) || 20,
          timeEstimate: form.timeEstimate || undefined,
          instructions,
        };
        setResult(await generateAssignment(payload));
      } else {
        payload = {
          courseId,
          lessonId,
          questionType: form.questionType || "mcq",
          difficulty: form.difficulty,
          questionCount: Number(form.questionCount) || 5,
          marksPerQuestion: Number(form.marksPerQuestion) || 1,
          instructions,
        };
        setResult(await generateQuiz(payload));
      }

      if (onGenerated) onGenerated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The AI couldn't generate that just now.");
    } finally {
      setBusy(false);
    }
  }, [courseId, form, kind, onGenerated]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              kind === id
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-brand-50 dark:bg-ink-800 dark:text-slate-300 dark:hover:bg-ink-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {lessons.length > 0 && (
          <Field label="Ground it in a lesson" hint="Optional, but it makes the output fit your course far better.">
            <Select value={form.lessonId || ""} onChange={(e) => update({ lessonId: e.target.value })}>
              <option value="">No specific lesson</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.label}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {kind !== "material" && (
          <Field label="Difficulty">
            <Select value={form.difficulty} onChange={(e) => update({ difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {kind === "lecture" && (
          <>
            <Field label="Topic" hint="What should this lecture cover?">
              <TextInput
                value={form.topic || ""}
                onChange={(e) => update({ topic: e.target.value })}
                placeholder="e.g. Recursion and the call stack"
              />
            </Field>
            <Field label="Level">
              <TextInput
                value={form.level || ""}
                onChange={(e) => update({ level: e.target.value })}
                placeholder="e.g. second-year undergraduate"
              />
            </Field>
            <Field label="Duration (minutes)">
              <TextInput
                type="number"
                min="5"
                max="300"
                value={form.duration || 45}
                onChange={(e) => update({ duration: e.target.value })}
              />
            </Field>
          </>
        )}

        {kind === "material" && (
          <Field label="Material type">
            <Select value={form.materialType || "study_guide"} onChange={(e) => update({ materialType: e.target.value })}>
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {kind === "assignment" && (
          <>
            <Field label="Type">
              <Select
                value={form.assignmentType || "problem_set"}
                onChange={(e) => update({ assignmentType: e.target.value })}
              >
                {ASSIGNMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Number of tasks">
              <TextInput
                type="number"
                min="1"
                max="10"
                value={form.taskCount || 3}
                onChange={(e) => update({ taskCount: e.target.value })}
              />
            </Field>
            <Field label="Total marks">
              <TextInput
                type="number"
                min="1"
                max="1000"
                value={form.totalMarks || 20}
                onChange={(e) => update({ totalMarks: e.target.value })}
              />
            </Field>
            <Field label="Time estimate" hint="e.g. 90 minutes">
              <TextInput
                value={form.timeEstimate || ""}
                onChange={(e) => update({ timeEstimate: e.target.value })}
                placeholder="90 minutes"
              />
            </Field>
          </>
        )}

        {kind === "quiz" && (
          <>
            <Field label="Question type">
              <Select
                value={form.questionType || "mcq"}
                onChange={(e) => update({ questionType: e.target.value })}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="How many questions">
              <TextInput
                type="number"
                min="1"
                max="30"
                value={form.questionCount || 5}
                onChange={(e) => update({ questionCount: e.target.value })}
              />
            </Field>
            <Field label="Marks per question">
              <TextInput
                type="number"
                min="1"
                max="20"
                value={form.marksPerQuestion || 1}
                onChange={(e) => update({ marksPerQuestion: e.target.value })}
              />
            </Field>
          </>
        )}
      </div>

      <Field label="Extra instructions" hint="Anything specific you want covered, excluded, or emphasised.">
        <TextArea
          rows={2}
          value={form.instructions || ""}
          onChange={(e) => update({ instructions: e.target.value })}
          placeholder="Keep it aligned with our week 3 lab. Avoid recursion, we cover that next week."
        />
      </Field>

      <div>
        <Button onClick={submit} isLoading={busy} loadingText="Generating…" disabled={!courseId}>
          <Sparkles className="h-4 w-4" />
          Generate {kind}
        </Button>
      </div>

      {error && <Notice>{error}</Notice>}

      {busy && <AiWorking status={status} />}

      {!busy && result && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-ink-700">
          <div className="flex flex-wrap items-center gap-2">
            <AiPill kind="ok">Draft ready</AiPill>
            <span className="text-xs text-slate-400">
              Saved as a draft. Review, edit and publish it from the Drafts tab.
            </span>
          </div>
          <AiDraftNotice />
          <AiContentPreview content={result.content} />

          {kind === "quiz" && result.answerKey && (
            <details className="rounded-xl bg-amber-50/70 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <summary className="cursor-pointer font-semibold">Instructor answer key</summary>
              <p className="mt-2 whitespace-pre-line font-mono text-[11px] leading-relaxed">{result.answerKey}</p>
              <p className="mt-2 font-sans">
                Students only ever see the question paper. This key stays with the draft.
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
