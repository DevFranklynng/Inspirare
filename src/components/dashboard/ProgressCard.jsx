import { BookOpen, CalendarCheck, TrendingUp, Trophy } from "lucide-react";
import { ProgressRing } from "../ui/Progress";
import Card from "../ui/Card";

function SnapshotTile({ icon: Icon, label, value, detail, accent }) {
  return (
    <section className="academic-tile flex min-h-[176px] flex-col justify-between rounded-2xl border border-[#ece7f7] bg-[#fcfbff] p-4 dark:border-ink-700 dark:bg-ink-800/60">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</h3>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{detail}</p>
      </div>
    </section>
  );
}

function CourseProgressTile({ courses }) {
  const lessonTotals = (courses || []).reduce(
    (totals, course) => ({
      completed: totals.completed + (Number(course.completed_lessons) || 0),
      total: totals.total + (Number(course.total_lessons) || 0),
    }),
    { completed: 0, total: 0 }
  );
  const progress = lessonTotals.total
    ? Math.round((lessonTotals.completed / lessonTotals.total) * 100)
    : 0;
  const courseLabel = courses?.length === 1 ? courses[0].title : `${courses?.length || 0} courses`;

  return (
    <section className="academic-tile flex min-h-[176px] flex-col justify-between rounded-2xl border border-[#ece7f7] bg-[#fcfbff] p-4 dark:border-ink-700 dark:bg-ink-800/60">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400">Course progress</h3>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0edfc] text-[#7463d7] dark:bg-brand-500/15 dark:text-brand-300">
          <BookOpen className="h-4 w-4" />
        </span>
      </div>
      {courses?.length ? (
        <div className="flex items-center justify-center gap-3">
          <ProgressRing value={progress} size={72} ringClassName="stroke-brand-500" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-semibold text-slate-700 dark:text-slate-300">{courseLabel}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {lessonTotals.completed}/{lessonTotals.total} lessons complete
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No enrolled course yet</p>
      )}
    </section>
  );
}

export default function ProgressCard({ courses, academicStanding, attendance }) {
  const rawCgpa = academicStanding?.cumulative_cgpa;
  const cgpa = rawCgpa != null && rawCgpa !== "" && Number.isFinite(Number(rawCgpa))
    ? Number(rawCgpa).toFixed(2)
    : "—";
  const position = academicStanding?.class_position;
  const classSize = academicStanding?.enrolled_students;
  const positionValue = position == null ? "—" : `#${position}`;
  const positionDetail = classSize == null
    ? "Position among enrolled students"
    : classSize === 0
      ? "Enroll in a course to see your position"
      : `of ${classSize} enrolled ${classSize === 1 ? "student" : "students"}`;
  const attendanceValue = attendance?.is_marked
    ? `${attendance.attendance_percent}%`
    : "—";
  const attendanceDetail = attendance?.is_marked
    ? `${attendance.present}/${attendance.marked} classes attended`
    : courses?.length
      ? attendance
        ? "No classes marked yet"
        : "Attendance is unavailable right now"
      : "Enroll in a course to track attendance";

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Academic snapshot</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CourseProgressTile courses={courses} />
        <SnapshotTile
          icon={TrendingUp}
          label="Cumulative CGPA"
          value={cgpa}
          detail={cgpa === "—" ? "Available after your first graded assessment" : "Current academic average"}
          accent="bg-[#f0edfc] text-[#7463d7] dark:bg-brand-500/15 dark:text-brand-300"
        />
        <SnapshotTile
          icon={Trophy}
          label="Class position"
          value={positionValue}
          detail={positionDetail}
          accent="bg-[#fff4e7] text-[#dc9346] dark:bg-amber-500/10 dark:text-amber-300"
        />
        <SnapshotTile
          icon={CalendarCheck}
          label="Attendance"
          value={attendanceValue}
          detail={attendanceDetail}
          accent="bg-[#eaf7f3] text-[#389879] dark:bg-emerald-500/10 dark:text-emerald-300"
        />
      </div>
    </Card>
  );
}
