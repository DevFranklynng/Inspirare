import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 py-12 text-center">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <p className="max-w-sm text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="border-red-200 text-red-700 hover:bg-red-50">
          Try again
        </Button>
      )}
    </div>
  );
}
