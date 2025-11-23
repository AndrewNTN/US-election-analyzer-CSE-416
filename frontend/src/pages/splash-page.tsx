import { useState, useMemo } from "react";
import { IconChartBar } from "@tabler/icons-react";

import BaseMap from "@/components/map/base-map.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import AnalysisDrawer from "@/components/analysis-drawer.tsx";
import { ChoroplethLegend } from "@/components/map/choropleth-legend";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useStatesGeoJsonQuery } from "@/lib/api/use-queries.ts";

import {
  SPLASH_CHOROPLETH_OPTIONS,
  SPLASH_CHOROPLETH_LABELS,
  equipmentAgeScale,
  type SplashChoroplethOption,
} from "@/lib/choropleth.ts";

import { MapLoading } from "@/components/ui/map-loading";
import { MapError } from "@/components/ui/map-error";

export default function SplashPage() {
  const [open, setOpen] = useState(false);
  const [choroplethOption, setChoroplethOption] =
    useState<SplashChoroplethOption>(SPLASH_CHOROPLETH_OPTIONS.OFF);

  const handleChoroplethChange = (value: string) => {
    setChoroplethOption(value as SplashChoroplethOption);
  };

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

  // Calculate dynamic color scale based on the current data and option
  const dynamicScale = useMemo(() => {
    if (choroplethOption === SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE) {
      return equipmentAgeScale;
    }
    return null;
  }, [choroplethOption]);

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

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Choropleth:
                </label>
                <Select
                  value={choroplethOption}
                  onValueChange={handleChoroplethChange}
                >
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SPLASH_CHOROPLETH_OPTIONS).map((option) => (
                      <SelectItem key={option} value={option}>
                        {SPLASH_CHOROPLETH_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis drawer */}
      <AnalysisDrawer open={open} onOpenChange={setOpen} />

      {/* Map in background */}
      <div className="absolute inset-0 z-0">
        <BaseMap style={{ width: "100%", height: "100vh", zIndex: 0 }}>
          <ChoroplethLayer
            data={safeStatesData}
            choroplethOption={choroplethOption}
            colorScale={dynamicScale}
          />
          <OutlineLayer data={safeStatesData} />
        </BaseMap>

        {/* Choropleth Legend */}
        {choroplethOption && choroplethOption !== "off" && (
          <div className="absolute bottom-32 left-4 z-10 max-w-xs">
            <ChoroplethLegend
              choroplethOption={choroplethOption}
              colorScale={dynamicScale}
            />
          </div>
        )}
      </div>
    </div>
  );
}
