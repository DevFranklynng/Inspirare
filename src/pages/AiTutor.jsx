import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, Send, Sparkles, BookOpen, GraduationCap, History, Plus, Lightbulb, RefreshCw, FileText } from "lucide-react";
import { askTutor, fetchTutorConversations } from "../api/ai";
import { fetchCourses } from "../api/courses";
import { ApiError } from "../api/client";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { Select, TextArea } from "../components/instructor/Field";
import { AiUnavailableBanner, AiPill } from "../components/ai/AiPrimitives";
import { useAiStatus } from "../components/ai/useAiStatus";

/**
 * Student AI Tutor.
 *
 * Grounded in the student's own enrolled course/lesson/assignment — the backend
 * enforces that scope, this page just makes the choice explicit. In assignment
 * mode the tutor is instructed to give hints rather than finished answers, so
 * the mode switch is framed around that.
 */

const MODES = [
  { id: "explain", label: "Explain", icon: BookOpen, hint: "Explain a concept in simpler terms." },
  { id: "hint", label: "Hint", icon: Lightbulb, hint: "Give me a nudge without the full answer." },
  { id: "revise", label: "Revise", icon: RefreshCw, hint: "Quiz me on what I've learned." },
];

const STARTERS = [
  "Explain the difference between a list and a tuple.",
  "Walk me through how this week's lesson actually works.",
  "I'm stuck on the last question — give me a hint.",
  "Quiz me on the key ideas from this lesson.",
];

export default function AiTutor() {
  const { status: aiStatus } = useAiStatus();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState(null);
  const [courseId, setCourseId] = useState(searchParams.get("course") || "");
  const [mode, setMode] = useState("explain");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);
  const [grounded, setGrounded] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchCourses();
        if (cancelled) return;
        setCourses(rows);
        setCourseId((prev) => prev || (rows[0] && rows[0].id) || "");
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "We couldn't load your courses.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text) => {
      const body = (text ?? question).trim();
      if (!body || asking) return;

      setError(null);
      setAsking(true);
      setQuestion("");

      // Show the student's message immediately; the tutor's reply is appended
      // when the request resolves.
      setMessages((prev) => [...prev, { role: "user", content: body, id: `local-${Date.now()}` }]);

      try {
        const result = await askTutor({ courseId, conversationId, question: body, mode });
        setConversationId(result.conversation?.id || null);
        setMessages((prev) => [
          ...prev,
          { ...result.answer_message, id: result.answer_message?.id || `a-${Date.now()}` },
        ]);
        setFollowUps(result.follow_up ? [result.follow_up] : []);
        setGrounded(result.grounded);
      } catch (err) {
        // Roll the optimistic message back so the input isn't left lying.
        setMessages((prev) => prev.slice(0, -1));
        setQuestion(body);
        setError(err instanceof ApiError ? err.message : "The tutor couldn't answer just now.");
      } finally {
        setAsking(false);
      }
    },
    [asking, conversationId, courseId, mode, question]
  );

  const startNew = () => {
    setMessages([]);
    setFollowUps([]);
    setConversationId(null);
    setGrounded(null);
    setError(null);
  };

  const aiUnavailable = aiStatus && !aiStatus.configured;

  if (courses === null && !error) return <LoadingState label="Loading your courses…" />;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            <GraduationCap className="h-6 w-6 text-brand-600" />
            AI Tutor
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Ask about the material in your courses. Grounded in your own lessons, not the open web.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="secondary" onClick={startNew}>
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
        )}
      </header>

      <AiUnavailableBanner status={aiStatus} />

      <Card tint="soft" className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Course context</span>
            <Select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                startNew();
              }}
              disabled={!courses?.length}
            >
              {courses?.length ? (
                courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))
              ) : (
                <option value="">No courses available</option>
              )}
            </Select>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mode</span>
            <div className="flex gap-1.5">
              {MODES.map(({ id, label, icon: Icon, hint }) => (
                <button
                  key={id}
                  type="button"
                  title={hint}
                  onClick={() => setMode(id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                    mode === id
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-500 hover:bg-brand-50 dark:bg-ink-900 dark:text-slate-400 dark:hover:bg-ink-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode === "hint" && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Hint mode nudges you toward the answer without handing it over — useful while you're still
            working the problem out yourself.
          </p>
        )}
      </Card>

      {error && <ErrorState message={error} />}

      <Card className="flex min-h-[22rem] flex-col gap-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="Ask your tutor anything about this course"
            description="The tutor reads your course's lessons and materials, so it can explain what your class actually covered."
          />
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            {messages.map((message) =>
              message.role === "user" ? (
                <Bubble key={message.id} align="right">
                  {message.content}
                </Bubble>
              ) : (
                <Bubble key={message.id} align="left" citations={message.citations}>
                  {message.content}
                </Bubble>
              )
            )}

            {asking && (
              <Bubble align="left" loading>
                <span className="flex items-center gap-2 text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  Thinking…
                </span>
              </Bubble>
            )}

            {grounded === false && !asking && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                I couldn't find anything on this in your course material, so this answer may be general
                rather than specific to your class.
              </p>
            )}
          </div>
        )}

        {followUps.length > 0 && !asking && (
          <div className="flex flex-wrap gap-2">
            {followUps.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => send(suggestion)}
                className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => send(starter)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-slate-400 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 border-t border-slate-100 pt-3 dark:border-ink-700">
          <TextArea
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={aiUnavailable ? "AI is currently unavailable." : "Ask a question about this course…"}
            disabled={asking || aiUnavailable || !courseId}
            className="flex-1"
          />
          <Button onClick={() => send()} isLoading={asking} disabled={!question.trim() || !courseId} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div ref={bottomRef} />
      </Card>

      <TutorHistory />
    </div>
  );
}

function Bubble({ children, align, citations, loading }) {
  const isUser = align === "right";
  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-brand-600 text-white"
            : "bg-slate-50 text-slate-800 dark:bg-ink-800 dark:text-slate-100"
        }`}
      >
        {children}
      </div>
      {citations && citations.length > 0 && (
        <div className="flex max-w-[85%] flex-wrap gap-1.5">
          {citations.map((source) => (
            <AiPill key={source.id || source.title} kind="neutral">
              <FileText className="h-3 w-3" />
              {source.title}
            </AiPill>
          ))}
        </div>
      )}
    </div>
  );
}

/** The student's own past tutor threads. Owner-scoped by the backend. */
function TutorHistory() {
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchTutorConversations()
      .then((rows) => !cancelled && setConversations(rows))
      .catch(() => !cancelled && setConversations([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!conversations || conversations.length === 0) return null;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your recent conversations</h2>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {conversations.slice(0, 6).map((conversation) => (
          <li
            key={conversation.id}
            className="truncate rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-ink-800 dark:text-slate-400"
          >
            {conversation.title || "Untitled conversation"}
            {conversation.message_count > 0 && (
              <span className="ml-1 text-slate-400">· {conversation.message_count} messages</span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
