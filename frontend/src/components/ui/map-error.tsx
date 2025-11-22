import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function MapError({
  message = "Failed to load map data",
  onRetry,
}: MapErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-gray-50/50 backdrop-blur-sm rounded-lg border border-red-100">
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl" />
        <AlertCircle className="w-10 h-10 text-red-500 relative z-10" />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-2">{message}</p>
      <p className="text-xs text-gray-500 max-w-[250px] text-center mb-4">
        There was a problem loading the election data. Please check your
        connection and try again.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
