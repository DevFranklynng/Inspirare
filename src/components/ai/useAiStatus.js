import { useCallback, useEffect, useState } from "react";
import { fetchAiStatus } from "../../api/ai";

/**
 * Loads GET /api/ai/status once per mount and shares it.
 *
 * The status tells the UI which model is live, whether the provider is
 * reachable, and — crucially — whether AI is switched off server-side, so the
 * screens can show a setup banner instead of failing on the first generate.
 *
 * It never throws: a status endpoint that is down degrades to an "unavailable"
 * banner, which is the right outcome for a non-essential capability.
 */
export function useAiStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAiStatus();
      setStatus(data);
    } catch {
      setStatus({
        configured: false,
        enabled: false,
        problem: "We couldn't reach the AI service. Check that the backend is running.",
        setup_hint: "The AI Sub-Instructor is optional — the rest of Inspirare works without it.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    status,
    loading,
    reload: load,
    /** True only when the backend says AI is enabled AND configured. */
    available: Boolean(status?.enabled && status?.configured),
  };
}

export default useAiStatus;
