import {
  Bell,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  CalendarDays,
  GraduationCap,
  Award,
  UserMinus,
  Megaphone,
  Upload,
  UserPlus,
  UserX,
  AlertTriangle,
} from "lucide-react";

/**
 * Presentation for each notification_type: which icon to show, and the colour
 * family the row is tinted with.
 *
 * `tone` is deliberately one of a few buckets rather than a colour per type,
 * so the inbox stays calm: a wall of 19 different hues is unreadable. The
 * buckets mean something to the reader -
 *   info     something was added or changed
 *   success  good news about you (enrolled, graded)
 *   warning  a deadline approaching
 *   danger   a deadline missed
 *   neutral  account-level changes
 */
const META = {
  course_updated: { icon: BookOpen, tone: "info", label: "Course" },
  assignment_new: { icon: ClipboardCheck, tone: "info", label: "Assignment" },
  assignment_updated: { icon: ClipboardCheck, tone: "info", label: "Assignment" },
  assignment_due_soon: { icon: AlertTriangle, tone: "warning", label: "Due soon" },
  assignment_overdue: { icon: AlertTriangle, tone: "danger", label: "Overdue" },
  lesson_new: { icon: FileText, tone: "info", label: "Lesson" },
  lesson_updated: { icon: FileText, tone: "info", label: "Lesson" },
  material_new: { icon: FolderOpen, tone: "info", label: "Material" },
  material_updated: { icon: FolderOpen, tone: "info", label: "Material" },
  session_new: { icon: CalendarDays, tone: "info", label: "Class" },
  session_updated: { icon: CalendarDays, tone: "warning", label: "Rescheduled" },
  grade_posted: { icon: Award, tone: "success", label: "Graded" },
  enrolled: { icon: GraduationCap, tone: "success", label: "Enrolled" },
  unenrolled: { icon: UserMinus, tone: "neutral", label: "Unenrolled" },
  announcement: { icon: Megaphone, tone: "info", label: "Announcement" },
  submission_new: { icon: Upload, tone: "info", label: "Submitted" },
  submission_resubmitted: { icon: Upload, tone: "warning", label: "Re-submitted" },
  student_enrolled: { icon: UserPlus, tone: "success", label: "New student" },
  student_unenrolled: { icon: UserX, tone: "neutral", label: "Student removed" },
};

const FALLBACK = { icon: Bell, tone: "info", label: "Update" };

/** Icon component, colour classes and short label for a notification type. */
export function getNotificationMeta(type) {
  return META[type] || FALLBACK;
}

/** Tailwind classes for the icon chip and the unread accent. */
export const TONE_CLASSES = {
  info: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
  success: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  danger: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  neutral: "bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-300",
};
