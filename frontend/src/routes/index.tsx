import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import BaseMap from "@/components/map-component.tsx";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative min-h-screen">
      {/* Content overlay */}
      <div className="relative z-10 p-5 bg-white/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg mb-6">This is the index page.</p>
          <Button>Button Text</Button>
        </div>
      </div>

      {/* Map in background */}
      <div className="absolute inset-0 z-0">
        <BaseMap style={{ width: "100%", height: "100vh", zIndex: 0 }} />
      </div>
    </div>
  );
}
