import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { ApiError } from "../api/client";

export default function Settings() {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const track = profile?.track && profile.track.length > 0 ? profile.track.join(", ") : "Not assigned yet";

  async function handleSave(e) {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim() === profile?.full_name) return;
    setSaving(true);
    setNotice(null);
    try {
      await updateProfile({ fullName: fullName.trim() });
      setNotice({ type: "success", message: "Name updated." });
    } catch (err) {
      setNotice({ type: "error", message: err instanceof ApiError ? err.message : "Couldn't update your name." });
    } finally {
      setSaving(false);
    }
  }

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
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>

          {notice && (
            <p className={`rounded-lg px-3 py-2 text-sm ${notice.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              {notice.message}
            </p>
          )}

          <Button type="submit" isLoading={saving} loadingText="Saving…" disabled={!fullName.trim() || fullName.trim() === profile?.full_name} className="w-fit">
            Save name
          </Button>
        </form>
      </Card>

      <Card>
        <dl className="divide-y divide-slate-100">
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-slate-400">Role</dt>
            <dd className="font-medium capitalize text-slate-700">{profile?.role}</dd>
          </div>
          <div className="flex items-center justify-between py-3 text-sm">
            <dt className="text-slate-400">Track</dt>
            <dd className="max-w-xs text-right font-medium text-slate-700">{track}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
