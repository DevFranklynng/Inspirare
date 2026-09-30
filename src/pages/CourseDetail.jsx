import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCourse, updateCourse } from "../api/courses";
import { completeLesson } from "../api/lessons";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import ModuleAccordion from "../components/courses/ModuleAccordion";
import CourseTabs from "../components/instructor/CourseTabs";
import LessonManager from "../components/instructor/LessonManager";
import AssignmentManager from "../components/instructor/AssignmentManager";
import ScheduleManager from "../components/instructor/ScheduleManager";
import MaterialsManager from "../components/instructor/MaterialsManager";
import AttendanceManager from "../components/instructor/AttendanceManager";
import StudentAssignmentsPanel from "../components/student/StudentAssignmentsPanel";
import StudentSchedulePanel from "../components/student/StudentSchedulePanel";
import StudentMaterialsPanel from "../components/student/StudentMaterialsPanel";
import { Field, TextInput, TextArea } from "../components/instructor/Field";
import {
  ArrowLeft,
  Layers,
  BookOpen,
  ClipboardList,
  CalendarDays,
  FolderOpen,
  Users,
  Pencil,
  X,
  Check,
} from "lucide-react";

const instructorTabs = [
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "materials", label: "Materials", icon: FolderOpen },
  { id: "attendance", label: "Attendance", icon: Users },
];

const studentTabs = [
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "materials", label: "Materials", icon: FolderOpen },
];

export default function CourseDetail() {
  const { id } = useParams();
  const { isInstructor } = useAuth();

  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("lessons");

  // Lesson completion is tracked locally (see comment in the student branch).
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [completingId, setCompletingId] = useState(null);

  // Inline course-title/description editing (instructors only).
  const [editingDetails, setEditingDetails] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fetchCourse(id);
      setCourse(result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this course.");
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveDetails() {
    if (!draftTitle.trim()) return;
    setSavingDetails(true);
    setNotice(null);
    try {
      const updated = await updateCourse(id, {
        title: draftTitle.trim(),
        description: draftDescription.trim() || null,
      });
      setCourse((c) => ({ ...c, ...updated }));
      setEditingDetails(false);
      setNotice({ type: "success", message: "Course details updated." });
    } catch (err) {
      setNotice({
        type: "error",
        message: err instanceof ApiError ? err.message : "Couldn't update the course.",
      });
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleCompleteLesson(lessonId) {
    setCompletingId(lessonId);
    try {
      await completeLesson(lessonId);
      setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
    } catch (err) {
      setNotice({ type: "error", message: err instanceof ApiError ? err.message : "Couldn't mark that lesson complete." });
    } finally {
      setCompletingId(null);
    }
  }

  if (status === "loading") return <LoadingState label="Loading course…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  const canComplete = !isInstructor && course.is_enrolled !== false;

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/courses"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="flex flex-col gap-3 rounded-xl3 bg-white p-5 shadow-soft dark:bg-ink-900 dark:border dark:border-ink-700 sm:flex-row sm:items-center sm:justify-between">
        {isInstructor && editingDetails ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveDetails();
            }}
            className="flex w-full flex-col gap-3"
          >
            <Field label="Course title">
              <TextInput value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} autoFocus />
            </Field>
            <Field label="Description">
              <TextArea value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} rows={2} />
            </Field>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" isLoading={savingDetails} loadingText="Saving…">
                <Check className="h-3.5 w-3.5" /> Save details
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  setEditingDetails(false);
                  setNotice(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{course.title}</h1>
              {course.description && (
                <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{course.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {isInstructor && (
                <Button
                  variant="ghost"
                  className="px-3 py-2 text-xs"
                  onClick={() => {
                    setDraftTitle(course.title);
                    setDraftDescription(course.description || "");
                    setEditingDetails(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
              {!isInstructor && course.is_enrolled === false && (
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-ink-700 dark:text-slate-300">
                  Not enrolled — an administrator needs to enroll you
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {notice && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            notice.type === "error"
              ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
              : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
          }`}
        >
          {notice.message}
        </p>
      )}

      {isInstructor ? (
        <>
          <CourseTabs tabs={instructorTabs} active={activeTab} onChange={setActiveTab} />

          {activeTab === "lessons" && (
            <LessonManager
              courseId={course.id}
              modules={course.modules || []}
              onChanged={load}
              onError={(message, successMessage) =>
                setNotice({ type: successMessage ? "success" : "error", message: message || successMessage })
              }
            />
          )}
          {activeTab === "assignments" && <AssignmentManager courseId={course.id} />}
          {activeTab === "schedule" && <ScheduleManager courseId={course.id} />}
          {activeTab === "materials" && <MaterialsManager courseId={course.id} />}
          {activeTab === "attendance" && <AttendanceManager courseId={course.id} />}
        </>
      ) : (
        <>
          <CourseTabs tabs={studentTabs} active={activeTab} onChange={setActiveTab} />

          {activeTab === "lessons" && (
            <div className="flex flex-col gap-3">
              {!course.modules || course.modules.length === 0 ? (
                <EmptyState icon={Layers} title="No modules yet" description="Modules and lessons will appear here once added." />
              ) : (
                course.modules
                  .slice()
                  .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                  .map((module) => (
                    <ModuleAccordion
                      key={module.id}
                      module={module}
                      completedLessonIds={completedLessonIds}
                      onCompleteLesson={handleCompleteLesson}
                      completingId={completingId}
                      canComplete={canComplete}
                    />
                  ))
              )}
            </div>
          )}
          {activeTab === "assignments" && <StudentAssignmentsPanel courseId={course.id} />}
          {activeTab === "schedule" && <StudentSchedulePanel courseId={course.id} />}
          {activeTab === "materials" && <StudentMaterialsPanel courseId={course.id} />}
        </>
      )}
    </div>
  );
}