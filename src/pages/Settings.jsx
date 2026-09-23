import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";

export default function Settings() {
  const { profile } = useAuth();

  const fields = [
    { label: "Full name", value: profile?.full_name },
    { label: "Role", value: profile?.role },
    { label: "Department", value: profile?.department || "Not set" },
    { label: "Level", value: profile?.level || "Not set" },
    { label: "Institution", value: profile?.institution || "Not set" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-400">Your Inspirare profile.</p>
      </div>

      <Card className="flex items-center gap-4">
        <Avatar name={profile?.full_name} src={profile?.avatar_url} size={56} />
        <div>
          <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
          <p className="text-xs capitalize text-slate-400">{profile?.role}</p>
        </div>
      </Card>

      <Card>
        <dl className="divide-y divide-slate-100">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between py-3 text-sm">
              <dt className="text-slate-400">{f.label}</dt>
              <dd className="font-medium capitalize text-slate-700">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
