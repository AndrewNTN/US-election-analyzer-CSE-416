import { Loader2 } from "lucide-react";

export function MapLoading() {
  const gradientId = "loader-gradient";

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-gray-50/50 backdrop-blur-sm rounded-lg border border-gray-100">
      <div className="relative flex items-center justify-center">
        {/* Gradient definition for SVG stroke */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.606 0.25 292.717)" />
              <stop offset="100%" stopColor="oklch(0.506 0.25 292.717)" />
            </linearGradient>
          </defs>
        </svg>

        <Loader2
          className="w-10 h-10 animate-spin relative z-10"
          style={{ stroke: `url(#${gradientId})` }}
        />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
        Loading map data...
      </p>
    </div>
  );
}
