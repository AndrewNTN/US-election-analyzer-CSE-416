import { createFileRoute } from "@tanstack/react-router";

import BaseMap from "@/components/base-map.tsx";
import AnalysisDrawer from "@/components/analysis-drawer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { IconChartBar } from "@tabler/icons-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* White background overlay */}
      <div className="relative z-10 bg-white/75 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="outline" onClick={() => setOpen(true)}>
              <IconChartBar /> Edit Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis drawer */}
      <AnalysisDrawer open={open} onOpenChange={setOpen} />

      {/* Map in background */}
      <div className="absolute inset-0 z-0">
        <BaseMap style={{ width: "100%", height: "100vh", zIndex: 0 }} />
      </div>
    </div>
  );
}
