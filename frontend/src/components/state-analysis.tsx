import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft } from "lucide-react";
import type { FeatureCollection, Geometry } from "geojson";

import BaseMap from "@/components/map/base-map.tsx";
import stateCentersData from "../../data/state-centers.json";
import statesJSON from "../../data/us-states.json";
import countiesJSON from "../../data/counties.geojson.json";
import type { StateProps, CountyProps } from "@/types/map";
import { DETAILED_STATES } from "@/constants/states";
import { getStateFipsCode } from "@/constants/stateFips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";

const statesData = statesJSON as FeatureCollection<Geometry, StateProps>;
const countiesData = countiesJSON as FeatureCollection<Geometry, CountyProps>;

const AnalysisType = {
  PROVISIONAL_BALLOT_CHART: "prov-ballot-bchart",
  PROVISIONAL_BALLOT_TABLE: "prob-ballot-table",
  ACTIVE_VOTERS_2024: "active-voters-2024",
  POLLBOOK_DELETIONS_2024: "pb-deletions-2024",
  MAIL_BALLOTS_REJECTED: "mail-ballots-rejected",
  STATE_EQUIPMENT_SUMMARY: "state-equip-summary",
} as const;

type AnalysisTypeValue = (typeof AnalysisType)[keyof typeof AnalysisType];

const analysisTypeLabels: Record<AnalysisTypeValue, string> = {
  [AnalysisType.PROVISIONAL_BALLOT_CHART]: "Provisional Ballot Bar Chart",
  [AnalysisType.PROVISIONAL_BALLOT_TABLE]: "Provisional Ballot Table",
  [AnalysisType.ACTIVE_VOTERS_2024]: "2024 EAVS Active Voters",
  [AnalysisType.POLLBOOK_DELETIONS_2024]: "2024 EAVS Pollbook Deletions",
  [AnalysisType.MAIL_BALLOTS_REJECTED]: "Mail Ballots Rejected",
  [AnalysisType.STATE_EQUIPMENT_SUMMARY]: "State Equipment Summary",
};

interface StateAnalysisProps {
  stateName: string;
}

interface StateBounds {
  center: number[];
  zoom: number;
}

const stateCenters: Record<string, StateBounds> = stateCentersData as Record<
  string,
  StateBounds
>;

export default function StateAnalysis({ stateName }: StateAnalysisProps) {
  const getStateBounds = (state: string): StateBounds => {
    const stateKey = state.toLowerCase().replace(/\s+/g, "-");
    const stateData = stateCenters[stateKey];

    if (stateData) {
      return {
        center: [stateData.center[0], stateData.center[1]] as [number, number],
        zoom: stateData.zoom,
      };
    }

    return { center: [39, -97.9], zoom: 5 };
  };

  const formatStateName = (stateName: string): string => {
    if (
      stateName === stateName.toLowerCase() ||
      stateName === stateName.toUpperCase()
    ) {
      return stateName
        .split(/[\s_-]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    }

    return stateName
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  // Filter states data to only include the current state
  const getCurrentStateData = (): FeatureCollection<Geometry, StateProps> => {
    const formattedStateName = formatStateName(stateName);

    const filteredFeatures = statesData.features.filter(
      (feature) => feature.properties?.NAME === formattedStateName,
    );

    return {
      ...statesData,
      features: filteredFeatures,
    };
  };

  // Check if current state is a detailed state
  const isDetailedState = (): boolean => {
    const urlStateName = stateName.toLowerCase().replace(/\s+/g, "-");
    return Object.keys(DETAILED_STATES).includes(urlStateName);
  };

  // Filter counties data for the current state (only for detailed states)
  const getCurrentCountiesData = (): FeatureCollection<
    Geometry,
    CountyProps
  > | null => {
    if (!isDetailedState()) {
      return null;
    }

    const formattedStateName = formatStateName(stateName);
    const stateFips = getStateFipsCode(formattedStateName);

    if (!stateFips) {
      return null;
    }

    const filteredFeatures = countiesData.features.filter(
      (feature) => feature.properties?.STATEFP === stateFips,
    );

    return {
      ...countiesData,
      features: filteredFeatures,
    };
  };

  const stateBounds = getStateBounds(stateName);
  const currentStateData = getCurrentStateData();
  const currentCountiesData = getCurrentCountiesData();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Map */}
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
              Back to Map
            </Link>
          </Button>
        </div>

        {/* State map */}
        <div className="w-full h-screen">
          <BaseMap
            center={stateBounds.center as [number, number]}
            zoom={stateBounds.zoom}
            style={{ width: "100%", height: "100%", zIndex: 0 }}
          >
            <ChoroplethLayer data={currentStateData} stateView={true} />

            {isDetailedState() && currentCountiesData ? (
              <OutlineLayer data={currentCountiesData} stateView={true} />
            ) : (
              <OutlineLayer data={currentStateData} stateView={true} />
            )}
          </BaseMap>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {formatStateName(stateName)}
          </h1>

          <div className="space-y-6">
            <div className="justify-self-center">
              <Select defaultValue={AnalysisType.PROVISIONAL_BALLOT_CHART}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AnalysisType).map((analysisType) => (
                    <SelectItem key={analysisType} value={analysisType}>
                      {analysisTypeLabels[analysisType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center">
              {/* TODO: add graphs here, i think we can use https://ui.shadcn.com/docs/components/data-table imo and then chart js for the rest*/}
              {/* Placeholder content, make separate components */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
