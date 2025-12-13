import { useState } from "react";
import { IconChartBar } from "@tabler/icons-react";

import BaseMap from "@/components/map/base-map.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import AnalysisDrawer from "@/components/analysis-drawer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useStatesGeoJsonQuery } from "@/lib/api/use-queries.ts";

import { SPLASH_CHOROPLETH_OPTIONS } from "@/lib/choropleth.ts";

import { MapLoading } from "@/components/ui/map-loading";
import { MapError } from "@/components/ui/map-error";

export default function SplashPage() {
  const [open, setOpen] = useState(false);

  const {
    data: statesData,
    isLoading,
    isError,
    refetch,
  } = useStatesGeoJsonQuery();

  const safeStatesData = statesData || {
    type: "FeatureCollection",
    features: [],
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <MapLoading />
      </div>
    );
  }

  if (isError || !statesData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <MapError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* White background overlay */}
      <div className="relative z-10 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-20">
              <Button variant="outline" onClick={() => setOpen(true)}>
                <IconChartBar /> More Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnalysisDrawer open={open} onOpenChange={setOpen} />

      {/* Map in background */}
      <div className="absolute inset-0 z-0">
        <BaseMap style={{ width: "100%", height: "100vh", zIndex: 0 }}>
          <ChoroplethLayer
            data={safeStatesData}
            choroplethOption={SPLASH_CHOROPLETH_OPTIONS.OFF}
            colorScale={null}
          />
          <OutlineLayer data={safeStatesData} />
        </BaseMap>
      </div>
    </div>
  );
}
