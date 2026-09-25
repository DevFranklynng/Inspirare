import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Card from "../ui/Card";

/**
 * Shared AI UI primitives.
 *
 * The rule every AI screen here follows: model output is never presented as
 * finished course content. It is always visibly a draft awaiting a human, and
 * publishing or approving is always a separate, explicit step.
 *
 * These are presentational only — the provider status is passed in as a prop
 * (see useAiStatus) rather than read from context, so they stay reusable and
 * contain no hook-order hazards.
 */

const tone = {
  info: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  warn: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  ok: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  neutral: "bg-slate-100 text-slate-600 dark:bg-ink-800 dark:text-slate-300",
};

export function AiPill({ children, kind = "info", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone[kind] || tone.info} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Shown on every AI screen when the backend reports the provider isn't usable.
 * Surfaces the backend's own explanation and setup hint instead of a raw 503.
 */
export function AiUnavailableBanner({ status }) {
  if (!status || status.configured) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">AI is not available right now</p>
          <p className="text-sm text-amber-700 dark:text-amber-400/90">{status.problem}</p>
          {status.setup_hint && (
            <p className="text-xs text-amber-600 dark:text-amber-500/80">{status.setup_hint}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Slim provider chip for page headers: the configured model, plus whether the
 * provider is actually reachable and whether the credential is accepted.
 * Wording stays provider-neutral so it reads correctly for OpenRouter (a hosted
 * API), a generic gateway, and a local runtime alike.
 */
export function AiProviderChip({ status }) {
  if (!status) return null;

  const unreachable = status.provider_reachable === false;
  const kind = status.configured === false || unreachable ? "warn" : "ok";
  const Icon = status.configured === false || unreachable ? AlertTriangle : CheckCircle2;

  return (
    <AiPill kind={kind}>
      <Icon className="h-3.5 w-3.5" />
      {status.model || "AI"}
      {unreachable && <span className="font-normal">· unreachable</span>}
      {status.key_valid === false && <span className="font-normal">· key rejected</span>}
      {status.model_installed === false && <span className="font-normal">· model not available</span>}
    </AiPill>
  );
}

/**
 * Waiting state for a generation call. Local models are slow, so this says what
 * is happening and roughly why, rather than showing a bare spinner.
 */
export function AiWorking({ status, label = "The AI is working on this…" }) {
  const model = status?.model;
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <Loader2 className="absolute h-10 w-10 animate-spin text-brand-300" />
        <Sparkles className="h-5 w-5 text-brand-600" />
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
      <p className="max-w-xs text-xs text-slate-400 dark:text-slate-500">
        {model
          ? `Running on ${model}. Local models can take a minute or two.`
          : "This can take a minute or two depending on your model."}
      </p>
    </div>
  );
}

/**
 * The banner that keeps the human-in-the-loop promise visible: this is a draft
 * until you approve and publish it.
 */
export function AiDraftNotice({ children = "This is an AI draft. Review and edit it before it becomes course content." }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-brand-50/70 px-3.5 py-3 text-xs text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

/**
 * Renders a read-only preview of generated structured content. Deliberately
 * simple: instructors edit the underlying draft through the API, and the real
 * content only becomes markdown/notes at publish time.
 */
export function AiContentPreview({ content }) {
  if (!content || typeof content !== "object") return null;

  return (
    <div className="flex flex-col gap-4 text-sm">
      {content.title && (
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{content.title}</h3>
      )}

      {Array.isArray(content.objectives) && content.objectives.length > 0 && (
        <PreviewSection title="Learning objectives">
          <ul className="list-inside list-disc space-y-1">
            {content.objectives.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </PreviewSection>
      )}

      {Array.isArray(content.sections) &&
        content.sections.map((section, i) => (
          <PreviewSection key={i} title={section.title}>
            <p className="whitespace-pre-line">{section.content}</p>
            {Array.isArray(section.examples) && section.examples.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600 dark:text-slate-400">
                {section.examples.map((ex, j) => (
                  <li key={j}>{ex}</li>
                ))}
              </ul>
            )}
          </PreviewSection>
        ))}

      {typeof content.instructions === "string" && (
        <PreviewSection title="Instructions">
          <p className="whitespace-pre-line">{content.instructions}</p>
        </PreviewSection>
      )}

      {Array.isArray(content.tasks) && content.tasks.length > 0 && (
        <PreviewSection title="Tasks">
          <ol className="space-y-2">
            {content.tasks.map((task, i) => (
              <li key={i}>
                <span className="font-medium">
                  {i + 1}. {task.title}
                </span>
                {task.marks !== undefined && <span className="text-slate-400"> ({task.marks} marks)</span>}
                <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
              </li>
            ))}
          </ol>
        </PreviewSection>
      )}

      {Array.isArray(content.rubric) && content.rubric.length > 0 && (
        <PreviewSection title="Grading rubric">
          <ul className="space-y-1">
            {content.rubric.map((row, i) => (
              <li key={i}>
                <span className="font-medium">{row.criterion || row.name}</span>
                {row.max_score !== undefined && <span className="text-slate-400"> — {row.max_score} marks</span>}
                {row.description && (
                  <p className="text-slate-600 dark:text-slate-400">{row.description}</p>
                )}
              </li>
            ))}
          </ul>
        </PreviewSection>
      )}

      {Array.isArray(content.questions) && content.questions.length > 0 && (
        <PreviewSection title={`Questions (${content.questions.length})`}>
          <ol className="space-y-3">
            {content.questions.map((q, i) => (
              <li key={i}>
                <p className="font-medium">
                  {i + 1}. {q.question}
                </p>
                {Array.isArray(q.options) && q.options.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-slate-600 dark:text-slate-400">
                    {q.options.map((opt, oi) => (
                      <li key={oi}>
                        {String.fromCharCode(97 + oi)}) {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </PreviewSection>
      )}

      {content.summary && (
        <PreviewSection title="Summary">
          <p className="whitespace-pre-line">{content.summary}</p>
        </PreviewSection>
      )}
    </div>
  );
}

function PreviewSection({ title, children }) {
  return (
    <section>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {title}
      </p>
      <div className="text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  );
}

export default {
  AiPill,
  AiUnavailableBanner,
  AiProviderChip,
  AiWorking,
  AiDraftNotice,
  AiContentPreview,
};
