import { useCallback, useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { sendAnnouncement, fetchAllCourses } from "../../../api/admin";
import { ApiError } from "../../../api/client";
import { AdminPanel, AdminSelect, AdminButton } from "./AdminUi";

/**
 * Admin broadcast composer.
 *
 * This is for the updates that are NOT caused by an instructor action inside a
 * course - a new term opening, a maintenance window, a policy change. Course
 * content changes (a new assignment, an edited lesson) raise notifications
 * automatically from the action that caused them, so an admin should not have
 * to announce those here as well.
 */

const AUDIENCES = [
  { value: "students", label: "Students only" },
  { value: "instructors", label: "Instructors only" },
  { value: "all", label: "Everyone" },
];

const inputClass =
  "w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder:text-ink-300 outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20";

export default function AnnouncePanel() {
  const [form, setForm] = useState({ title: "", body: "", audience: "students", courseId: "" });
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | sending
  const [notice, setNotice] = useState(null);

  // The course list is only needed for the optional "scoped to a course"
  // target. A failure here must not block announcing to an audience, so it is
  // caught and the selector simply stays empty.
  useEffect(() => {
    let active = true;
    fetchAllCourses()
      .then((data) => {
        if (active) setCourses(data || []);
      })
      .catch(() => {
        if (active) setCourses([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setNotice(null);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!form.title.trim()) {
        setNotice({ type: "error", message: "Give the announcement a title." });
        return;
      }

      setStatus("sending");
      setNotice(null);
      try {
        const result = await sendAnnouncement({
          title: form.title.trim(),
          body: form.body.trim() || undefined,
          audience: form.audience,
          courseId: form.courseId || null,
        });
        setNotice({ type: "success", message: result.message });
        // Clear only the text, keeping the audience and target so a follow-up
        // to the same group does not have to be re-targeted from scratch.
        setForm((prev) => ({ ...prev, title: "", body: "" }));
      } catch (err) {
        setNotice({
          type: "error",
          message: err instanceof ApiError ? err.message : "We couldn't send that announcement.",
        });
      } finally {
        setStatus("idle");
      }
    },
    [form]
  );

  return (
    <AdminPanel className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-gold-400" />
        <h2 className="text-sm font-semibold text-white">Send an announcement</h2>
      </div>
      <p className="mb-4 text-xs text-ink-300">
        Notifies everyone in an audience at once. Use this for platform-wide updates — changes
        inside a course already notify students on their own.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="announce-title" className="mb-1.5 block text-xs font-medium text-ink-200">
            Title
          </label>
          <input
            id="announce-title"
            type="text"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="New term opens on Monday"
            maxLength={120}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="announce-body" className="mb-1.5 block text-xs font-medium text-ink-200">
            Message <span className="text-ink-400">(optional)</span>
          </label>
          <textarea
            id="announce-body"
            rows={3}
            value={form.body}
            onChange={(e) => setField("body", e.target.value)}
            placeholder="Anything they need to know or do."
            maxLength={500}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="announce-audience" className="mb-1.5 block text-xs font-medium text-ink-200">
              Send to
            </label>
            <AdminSelect
              id="announce-audience"
              value={form.audience}
              onChange={(e) => setField("audience", e.target.value)}
            >
              {AUDIENCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
          </div>

          <div>
            <label htmlFor="announce-course" className="mb-1.5 block text-xs font-medium text-ink-200">
              About a course <span className="text-ink-400">(optional)</span>
            </label>
            <AdminSelect
              id="announce-course"
              value={form.courseId}
              onChange={(e) => setField("courseId", e.target.value)}
            >
              <option value="">The whole platform</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>

        {notice && (
          <p
            role="status"
            className={`rounded-lg px-3 py-2 text-sm ${
              notice.type === "error"
                ? "bg-red-950/50 text-red-300"
                : "bg-green-950/50 text-green-300"
            }`}
          >
            {notice.message}
          </p>
        )}

        <div className="flex justify-end">
          <AdminButton type="submit" isLoading={status === "sending"} loadingText="Sending…">
            <Megaphone className="h-4 w-4" />
            Send announcement
          </AdminButton>
        </div>
      </form>
    </AdminPanel>
  );
}
