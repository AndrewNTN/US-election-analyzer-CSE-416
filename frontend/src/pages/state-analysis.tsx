import { useState } from "react";
import statesJSON from "../../data/us-states.json";
import countiesJSON from "../../data/counties.geojson.json";
import type { CountyProps, StateProps } from "@/types/map.ts";
import { DETAILED_STATES, hasDetailedVoterData } from "@/constants/states.ts";
import { getStateFipsCode } from "@/constants/stateFips.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  STATE_CHOROPLETH_OPTIONS,
  type StateChoroplethOption,
} from "@/constants/choropleth.ts";
import StateMap from "@/components/map/state-map.tsx";
import type { FeatureCollection, Geometry } from "geojson";

//table imports
import { columns } from "../components/table/columns"
import { DataTable } from "../components/table/data-table"
import type {Voter} from "../components/table/columns"

const statesData = statesJSON as FeatureCollection<Geometry, StateProps>;
const countiesData = countiesJSON as FeatureCollection<Geometry, CountyProps>;


const AnalysisType = {
  PROVISIONAL_BALLOT_CHART: "prov-ballot-bchart",
  PROVISIONAL_BALLOT_TABLE: "prob-ballot-table",
  ACTIVE_VOTERS_2024: "active-voters-2024",
  POLLBOOK_DELETIONS_2024: "pb-deletions-2024",
  MAIL_BALLOTS_REJECTED: "mail-ballots-rejected",
  VOTER_REGISTRATION: "voter-registration",
  STATE_EQUIPMENT_SUMMARY: "state-equip-summary",
} as const;

type AnalysisTypeValue = (typeof AnalysisType)[keyof typeof AnalysisType];

const analysisTypeLabels: Record<AnalysisTypeValue, string> = {
  [AnalysisType.PROVISIONAL_BALLOT_CHART]: "Provisional Ballot Chart",
  [AnalysisType.PROVISIONAL_BALLOT_TABLE]: "Provisional Ballot Table",
  [AnalysisType.ACTIVE_VOTERS_2024]: "2024 EAVS Active Voters",
  [AnalysisType.POLLBOOK_DELETIONS_2024]: "2024 EAVS Pollbook Deletions",
  [AnalysisType.MAIL_BALLOTS_REJECTED]: "Mail Ballots Rejected",
  [AnalysisType.VOTER_REGISTRATION]: "Voter Registration",
  [AnalysisType.STATE_EQUIPMENT_SUMMARY]: "State Equipment Summary",
};

// Map analysis types to choropleth options
const analysisToChoroplethMap: Record<
  AnalysisTypeValue,
  StateChoroplethOption
> = {
  [AnalysisType.PROVISIONAL_BALLOT_CHART]:
    STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS,
  [AnalysisType.PROVISIONAL_BALLOT_TABLE]:
    STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS,
  [AnalysisType.ACTIVE_VOTERS_2024]: STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS,
  [AnalysisType.POLLBOOK_DELETIONS_2024]:
    STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS,
  [AnalysisType.MAIL_BALLOTS_REJECTED]:
    STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED,
  [AnalysisType.VOTER_REGISTRATION]:
    STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION,
  [AnalysisType.STATE_EQUIPMENT_SUMMARY]: STATE_CHOROPLETH_OPTIONS.OFF,
};

interface StateAnalysisProps {
  stateName: string;
  tableData: Voter[]; // modify based on how data is stored
}

export default function StateAnalysis({ stateName, tableData }: StateAnalysisProps) {
  const [selectedDataset, setSelectedDataset] = useState<AnalysisTypeValue>(
    AnalysisType.PROVISIONAL_BALLOT_CHART,
  );

  // Check if current state is a detailed state
  const isDetailedState = (): boolean => {
    const urlStateName = stateName.toLowerCase().replace(/\s+/g, "-");
    return Object.keys(DETAILED_STATES).includes(urlStateName);
  };

  // Set choropleth option based on selected dataset, but only for detailed states
  const choroplethOption = isDetailedState()
    ? analysisToChoroplethMap[selectedDataset]
    : STATE_CHOROPLETH_OPTIONS.OFF;

  const handleDatasetChange = (value: string) => {
    setSelectedDataset(value as AnalysisTypeValue);
  };

  const handleBackToMainMap = () => {
    window.history.back();
  };

  // Get available analysis options based on state capabilities
  const getAvailableAnalysisOptions = (): AnalysisTypeValue[] => {
    return Object.values(AnalysisType).filter((option) => {
      // Exclude voter registration if this state doesn't have detailed voter data
      if (option === AnalysisType.VOTER_REGISTRATION) {
        const urlStateName = stateName.toLowerCase().replace(/\s+/g, "-");
        return hasDetailedVoterData(urlStateName);
      }
      return true;
    });
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
      <div className="w-1/2 relative">
        {/* Floating back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button variant="outline" onClick={handleBackToMainMap}>
            ← Back to Main Map
          </Button>
        </div>

        {/* Map */}
        <StateMap
          currentStateData={currentStateData}
          currentCountiesData={currentCountiesData}
          isDetailedState={detailedState}
          choroplethOption={choroplethOption}
        />
      </div>

      {/* Right side - Content */}
      <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {formatStateName(stateName)}
          </h1>

          <div className="space-y-6">
            <div className="flex items-center space-x-2 justify-center">
              <label className="text-sm font-medium text-gray-700">
                Dataset:
              </label>
              <Select
                value={selectedDataset}
                onValueChange={handleDatasetChange}
                defaultValue={AnalysisType.PROVISIONAL_BALLOT_CHART}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableAnalysisOptions().map((analysisType) => (
                    <SelectItem key={analysisType} value={analysisType}>
                      {analysisTypeLabels[analysisType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center">
              <DataTable columns={columns} data={tableData} />
              {/* TODO: add graphs here, use https://ui.shadcn.com/docs/components/data-table imo and then chart js for the rest*/}
              {/* Placeholder content, make separate components */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
