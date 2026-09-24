import Card from "../ui/Card";
import { BookOpen, Users, ClipboardList } from "lucide-react";

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <Card tint={tint} className="flex items-center gap-4">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          tint === "white" ? "bg-brand-50 text-brand-600" : "bg-white/15 text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-xl font-bold ${tint === "white" ? "text-slate-900" : "text-white"}`}>{value}</p>
        <p className={`text-xs ${tint === "white" ? "text-slate-400" : "text-brand-100"}`}>{label}</p>
      </div>
    </Card>
  );
}

export default function InstructorSummary({ data }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard icon={BookOpen} label="Courses" value={data.total_courses ?? 0} tint="brand" />
      <StatCard icon={Users} label="Students" value={data.total_students ?? 0} tint="white" />
      <StatCard icon={ClipboardList} label="Pending submissions" value={data.pending_submissions ?? 0} tint="white" />
    </div>
  );
}
