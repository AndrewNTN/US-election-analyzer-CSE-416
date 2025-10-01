import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft } from "lucide-react";
import BaseMap from "@/components/map/base-map.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import type { StateProps, CountyProps } from "@/types/map.ts";

interface StateMapProps {
  currentStateData: FeatureCollection<Geometry, StateProps>;
  currentCountiesData: FeatureCollection<Geometry, CountyProps> | null;
  isDetailedState: boolean;
}

export default function StateMap({
  currentStateData,
  currentCountiesData,
  isDetailedState,
}: StateMapProps) {
  return (
    <div className="w-1/2 relative overflow-hidden">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="bg-white/90 backdrop-blur-sm"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main Map
          </Link>
        </Button>
      </div>

      {/* State map */}
      <div className="w-full h-screen">
        <BaseMap
          center={[39, -97]}
          zoom={4}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
          fitToGeoJSON={currentStateData}
        >
          <ChoroplethLayer data={currentStateData} stateView={true} />

          {isDetailedState && currentCountiesData ? (
            <OutlineLayer data={currentCountiesData} stateView={true} />
          ) : (
            <OutlineLayer data={currentStateData} stateView={true} />
          )}
        </BaseMap>
      </div>
    </div>
  );
}
