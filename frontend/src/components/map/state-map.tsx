import BaseMap from "@/components/map/base-map.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
import BubbleChartLayer, {
  type CensusBlockData,
} from "@/components/map/bubble-chart-layer.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import type { StateProps, CountyProps } from "@/types/map.ts";
import type { StateChoroplethOption } from "@/constants/choropleth.ts";
import { STATE_CHOROPLETH_OPTIONS } from "@/constants/choropleth.ts";
import { VotingEquipmentLegend } from "@/components/voting-equipment-legend.tsx";

interface StateMapProps {
  currentStateData: FeatureCollection<Geometry, StateProps>;
  currentCountiesData: FeatureCollection<Geometry, CountyProps> | null;
  isDetailedState: boolean;
  choroplethOption?: StateChoroplethOption;
  censusBlockData?: CensusBlockData[];
  showBubbleChart?: boolean;
  votingEquipmentData?: Array<{
    eavsRegion: string;
    equipmentTypes: string[];
    primaryEquipment: string;
  }>;
}

export default function StateMap({
  currentStateData,
  currentCountiesData,
  isDetailedState,
  choroplethOption,
  censusBlockData = [],
  showBubbleChart = false,
  votingEquipmentData = [],
}: StateMapProps) {
  const showEquipmentLegend =
    choroplethOption === STATE_CHOROPLETH_OPTIONS.VOTING_EQUIPMENT_TYPE &&
    votingEquipmentData.length > 0;

  return (
    <div className="relative overflow-hidden h-screen">
      {/* State map */}
      <div className="w-full h-full">
        <BaseMap
          center={[39, -97]}
          zoom={4}
          style={{ width: "100%", height: "78%", zIndex: 0 }}
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

          {/* Bubble chart overlay for political party dominance - rendered last to be on top */}
          <BubbleChartLayer data={censusBlockData} visible={showBubbleChart} />
        </BaseMap>

        {/* Voting Equipment Legend - positioned on the map */}
        {showEquipmentLegend && (
          <div className="absolute bottom-4 left-4 z-10 max-w-xs">
            <VotingEquipmentLegend data={votingEquipmentData} />
          </div>
        )}
      </div>
    </div>
  );
}
