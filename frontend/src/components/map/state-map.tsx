import BaseMap from "@/components/map/base-map.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import type { StateProps, CountyProps } from "@/types/map.ts";
import type { ChoroplethOption } from "@/constants/choropleth.ts";

interface StateMapProps {
  currentStateData: FeatureCollection<Geometry, StateProps>;
  currentCountiesData: FeatureCollection<Geometry, CountyProps> | null;
  isDetailedState: boolean;
  choroplethOption?: ChoroplethOption;
}

export default function StateMap({
  currentStateData,
  currentCountiesData,
  isDetailedState,
  choroplethOption,
}: StateMapProps) {
  return (
    <div className="relative overflow-hidden h-screen">
      {/* State map */}
      <div className="w-full h-full">
        <BaseMap
          center={[39, -97]}
          zoom={4}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
          fitToGeoJSON={currentStateData}
        >
          {/* Show county choropleth for detailed states, state choropleth otherwise */}
          {isDetailedState && currentCountiesData ? (
            <>
              <ChoroplethLayer
                data={currentCountiesData}
                choroplethOption={choroplethOption}
                stateView={true}
              />
              <OutlineLayer data={currentCountiesData} stateView={true} />
            </>
          ) : (
            <>
              <ChoroplethLayer
                data={currentStateData}
                choroplethOption={choroplethOption}
                stateView={true}
              />
              <OutlineLayer data={currentStateData} stateView={true} />
            </>
          )}
        </BaseMap>
      </div>
    </div>
  );
}
