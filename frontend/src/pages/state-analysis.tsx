import statesJSON from "../../data/us-states.json";
import countiesJSON from "../../data/counties.geojson.json";
import type { StateProps, CountyProps } from "@/types/map.ts";
import { DETAILED_STATES } from "@/constants/states.ts";
import { getStateFipsCode } from "@/constants/stateFips.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import StateMap from "@/components/map/state-map.tsx";
import type { FeatureCollection, Geometry } from "geojson";

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

export default function StateAnalysis({ stateName }: StateAnalysisProps) {
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

  const currentStateData = getCurrentStateData();
  const currentCountiesData = getCurrentCountiesData();
  const detailedState = isDetailedState();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Map */}
      <StateMap
        currentStateData={currentStateData}
        currentCountiesData={currentCountiesData}
        isDetailedState={detailedState}
      />
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
