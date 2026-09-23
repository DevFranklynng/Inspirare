import Card from "../ui/Card";
import { BookOpen, Users, ClipboardList } from "lucide-react";

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </Card>
  );
}

export default function InstructorSummary({ data }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard icon={BookOpen} label="Courses" value={data.total_courses ?? 0} />
      <StatCard icon={Users} label="Students" value={data.total_students ?? 0} />
      <StatCard icon={ClipboardList} label="Pending submissions" value={data.pending_submissions ?? 0} />
    </div>
  );
}
