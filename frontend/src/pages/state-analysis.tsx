import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import statesJSON from "../../data/us-states.json";
import countiesJSON from "../../data/counties.geojson.json";
import censusBlockDataJSON from "../../data/censusBlockData.json";
import type { CountyProps, StateProps } from "@/types/map.ts";
import { DETAILED_STATES, hasDetailedVoterData } from "@/constants/states.ts";
import { getStateFipsCode } from "@/constants/stateFips.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  STATE_CHOROPLETH_OPTIONS,
  type StateChoroplethOption,
} from "@/constants/choropleth.ts";
import StateMap from "@/components/map/state-map.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import type { CensusBlockData } from "@/components/map/bubble-chart-layer.tsx";

//table imports
import { VoterRegistrationTable } from "../components/table/voter-registration-table";
import eavsRegionVoterDataJson from "../../data/eavsRegionVoterData.json" with { type: "json" };
import { ProvisionBallotsTable } from "../components/table/provisional-ballot-table";
import provisionalBallotsDataJson from "../../data/provisionalBallotsData.json" with { type: "json" };

//chart imports
import { VoterRegistrationLineChart } from "../components/chart/voter-registration-line-chart";
import voterRegistrationDataJson from "../../data/voterRegistrationChanges.json" with { type: "json" };
import { ProvisionalBallotsBarChart } from "../components/chart/provisional-ballots-bar-chart";

const statesData = statesJSON as FeatureCollection<Geometry, StateProps>;
const countiesData = countiesJSON as FeatureCollection<Geometry, CountyProps>;
const censusBlockData = censusBlockDataJSON as CensusBlockData[];

// Voter registration data - already sorted by 2024 registered voters in ascending order
const voterRegistrationData = voterRegistrationDataJson as {
  jurisdiction: string;
  registeredVoters2016: number;
  registeredVoters2020: number;
  registeredVoters2024: number;
}[];

// EAVS region voter data for Florida counties
const eavsRegionVoterData = eavsRegionVoterDataJson as {
  eavsRegion: string;
  totalRegisteredVoters: number;
  democraticVoters: number;
  republicanVoters: number;
  unaffiliatedVoters: number;
  otherPartyVoters: number;
  registrationRate: number;
  activeVoters: number;
  inactiveVoters: number;
}[];

//Provisional Ballot Data
const provisionalBallotsData = provisionalBallotsDataJson as {
  E2a: number; // Total provisional ballots issued
  E2b: number; // Counted (fully/partially)
  E2c: number; // Rejected
  E2d: number; // Pending
  E2e: number; // Rejection: not registered
  E2f: number; // Rejection: wrong jurisdiction
  E2g: number; // Rejection: missing signature / ID
  E2h: number; // Rejection: other reasons
  E2i: string; // Notes / remarks
}[];

const AnalysisType = {
  PROVISIONAL_BALLOT: "prov-ballot-bchart",
  ACTIVE_VOTERS_2024: "active-voters-2024",
  POLLBOOK_DELETIONS_2024: "pb-deletions-2024",
  MAIL_BALLOTS_REJECTED: "mail-balots-rejected",
  VOTER_REGISTRATION: "voter-registration",
  VOTER_REGISTRATION_CHANGES: "voter-registration-changes",
  STATE_EQUIPMENT_SUMMARY: "state-equip-summary",
} as const;

type AnalysisTypeValue = (typeof AnalysisType)[keyof typeof AnalysisType];

const analysisTypeLabels: Record<AnalysisTypeValue, string> = {
  [AnalysisType.PROVISIONAL_BALLOT]: "Provisional Ballots",
  [AnalysisType.ACTIVE_VOTERS_2024]: "2024 EAVS Active Voters",
  [AnalysisType.POLLBOOK_DELETIONS_2024]: "2024 EAVS Pollbook Deletions",
  [AnalysisType.MAIL_BALLOTS_REJECTED]: "Mail Ballots Rejected",
  [AnalysisType.VOTER_REGISTRATION]: "Voter Registration",
  [AnalysisType.VOTER_REGISTRATION_CHANGES]: "Voter Registration Changes",
  [AnalysisType.STATE_EQUIPMENT_SUMMARY]: "State Equipment Summary",
};

// Map analysis types to choropleth options
const analysisToChoroplethMap: Record<
  AnalysisTypeValue,
  StateChoroplethOption
> = {
  [AnalysisType.PROVISIONAL_BALLOT]:
    STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS,
  [AnalysisType.ACTIVE_VOTERS_2024]: STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS,
  [AnalysisType.POLLBOOK_DELETIONS_2024]:
    STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS,
  [AnalysisType.MAIL_BALLOTS_REJECTED]:
    STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED,
  [AnalysisType.VOTER_REGISTRATION]:
    STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION,
  [AnalysisType.VOTER_REGISTRATION_CHANGES]:
    STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION,
  [AnalysisType.STATE_EQUIPMENT_SUMMARY]: STATE_CHOROPLETH_OPTIONS.OFF,
};

interface StateAnalysisProps {
  stateName: string;
}

export default function StateAnalysis({ stateName }: StateAnalysisProps) {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState<AnalysisTypeValue>(
    AnalysisType.PROVISIONAL_BALLOT,
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

  const handleBackToMainMap = () => {
    navigate({ to: "/" });
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

  const urlStateName = stateName.toLowerCase().replace(/\s+/g, "-");
  const showBubbleChart =
    selectedDataset === AnalysisType.VOTER_REGISTRATION &&
    hasDetailedVoterData(urlStateName);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToMainMap}>
            ← Back
          </Button>
          <h1 className="text-lg font-bold text-gray-900">
            {formatStateName(stateName)}
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left - Dataset Selector */}
        <div className="w-56 bg-gray-50 border-r p-3 overflow-y-auto flex-shrink-0">
          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Select Dataset
          </p>
          <div className="space-y-1">
            {getAvailableAnalysisOptions().map((analysisType) => (
              <Button
                key={analysisType}
                variant={
                  selectedDataset === analysisType ? "default" : "outline"
                }
                className="w-full justify-start text-xs h-8 font-normal"
                onClick={() => setSelectedDataset(analysisType)}
              >
                {analysisTypeLabels[analysisType]}
              </Button>
            ))}
          </div>
        </div>

        {/* Middle - Map */}
        <div className="w-[35%] relative flex-shrink-0">
          <StateMap
            currentStateData={currentStateData}
            currentCountiesData={currentCountiesData}
            isDetailedState={detailedState}
            choroplethOption={choroplethOption}
            censusBlockData={censusBlockData}
            showBubbleChart={showBubbleChart}
          />
        </div>

        {/* Right - Analysis Content */}
        <div className="flex-1 bg-white border-l overflow-y-auto min-w-0">
          <div className="p-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              {analysisTypeLabels[selectedDataset]}
            </h2>
            <div className="bg-gray-50 rounded-lg p-3">
              {selectedDataset === AnalysisType.VOTER_REGISTRATION_CHANGES ? (
                <div className="h-[400px]">
                  <VoterRegistrationLineChart data={voterRegistrationData} />
                </div>
              ) : selectedDataset === AnalysisType.VOTER_REGISTRATION ? (
                <div className="overflow-y-auto">
                  <VoterRegistrationTable data={eavsRegionVoterData} />
                </div>
              ) : selectedDataset === AnalysisType.STATE_EQUIPMENT_SUMMARY ? (
                <div className="text-xs text-muted-foreground text-center py-8">
                  Equipment data will be displayed here.
                </div>
              ) : selectedDataset === AnalysisType.PROVISIONAL_BALLOT ? (
                <div className="text-xs text-muted-foreground text-center py-8">
                  <ProvisionBallotsTable data={provisionalBallotsData} />
                  <ProvisionalBallotsBarChart
                    stateName={formatStateName(stateName)}
                    barData={provisionalBallotsData} ></ProvisionalBallotsBarChart>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {analysisTypeLabels[selectedDataset]} visualization will be
                  displayed here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
