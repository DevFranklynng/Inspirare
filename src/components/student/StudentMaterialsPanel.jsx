import { useCallback, useEffect, useState } from "react";
import { FolderOpen, Lock } from "lucide-react";
import { fetchCourseMaterials } from "../../api/materials";
import { ApiError } from "../../api/client";
import MaterialItem from "../materials/MaterialItem";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

export default function StudentMaterialsPanel({ courseId, onEnroll, enrolling }) {
  const [materials, setMaterials] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | locked
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchCourseMaterials(courseId);
      setMaterials(data || []);
      setStatus("success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setStatus("locked");
        return;
      }
      setError(err instanceof ApiError ? err.message : "We couldn't load this course's materials.");
      setStatus("error");
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <LoadingState label="Loading materials…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  if (status === "locked") {
    return (
      <EmptyState
        icon={Lock}
        title="Enroll to see materials"
        description="Course materials are only visible to students enrolled in this course."
        action={onEnroll && <Button isLoading={enrolling} loadingText="Enrolling…" onClick={onEnroll}>Enroll in this course</Button>}
      />
    );
  }

  if (materials.length === 0) {
    return <EmptyState icon={FolderOpen} title="No course materials yet" description="Files, links and notes your instructor shares will show up here." />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {materials.map((m) => (
        <MaterialItem key={m.id} material={m} />
      ))}
    </div>
  );
}
