import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import statesJSON from "../../data/us-states.json";
import countiesJSON from "../../data/counties.geojson.json";
// import censusBlockDataJSON from "../../data/censusBlockData.json";
import type { CountyProps, StateProps } from "@/types/map.ts";
import {
  DETAILED_STATES,
  hasDetailedVoterData,
  hasDropBoxVoting,
  getStateDetails,
} from "@/constants/states.ts";
import { getStateFipsCode } from "@/constants/stateFips.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  STATE_CHOROPLETH_OPTIONS,
  type StateChoroplethOption,
} from "@/lib/choropleth.ts";
import StateMap from "@/components/map/state-map.tsx";
import type { FeatureCollection, Geometry } from "geojson";
// import type { CensusBlockData } from "@/components/map/bubble-chart-layer.tsx";

//table imports
import { VoterRegistrationTable } from "../components/table/state-tables/voter-registration-table.tsx";
import eavsRegionVoterDataJson from "../../data/eavsRegionVoterData.json" with { type: "json" };
import { ProvisionBallotsTable } from "../components/table/state-tables/provisional-ballot-table.tsx";
import { ActiveVotersTable } from "../components/table/state-tables/active-voters-table.tsx";
import activeVotersDataJson from "../../data/activeVotersData.json" with { type: "json" };
import activeVotersDataCaliforniaJson from "../../data/activeVotersData-california.json" with { type: "json" };
import activeVotersDataFloridaJson from "../../data/activeVotersData-florida.json" with { type: "json" };
import pollbookDeletionsDataJson from "../../data/pollbookDeletionsData.json" with { type: "json" };
import { MailBallotsRejectedTable } from "../components/table/state-tables/mail-ballots-rejected-table.tsx";
import mailBallotsRejectedDataJson from "../../data/mailBallotsRejectedData.json" with { type: "json" };
import stateEquipmentSummaryJson from "../../data/stateEquipmentSummary.json" with { type: "json" };

//chart imports
import { VoterRegistrationLineChart } from "../components/chart/voter-registration-line-chart";
import voterRegistrationDataJson from "../../data/voterRegistrationChanges.json" with { type: "json" };
import {
  ProvisionalBallotsBarChart,
  type ProvisionBallotsData,
} from "../components/chart/provisional-ballots-bar-chart";
import { ActiveVotersBarChart } from "../components/chart/active-voters-bar-chart";
import { PollbookDeletionsBarChart } from "../components/chart/pollbook-deletions-bar-chart";
import { MailBallotsRejectedBarChart } from "../components/chart/mail-ballots-rejected-bar-chart";
import { DropBoxVotingBubbleChart } from "../components/chart/drop-box-voting-bubble-chart";
import dropBoxVotingDataJson from "../../data/dropBoxVotingData.json" with { type: "json" };
import { EquipmentQualityBubbleChart } from "../components/chart/equipment-quality-bubble-chart";
import equipmentQualityDataJson from "../../data/equipmentQualityVsRejectedBallots.json" with { type: "json" };
import {
  useProvisionalAggregateQuery,
  useProvisionalStateQuery,
} from "@/lib/api/use-eavs-queries.ts";
import { StateEquipmentSummaryTable } from "@/components/table/state-tables/state-equipment-summary-table.tsx";
import type { StateEquipmentSummary } from "@/components/table/state-tables/state-equipment-summary-columns.tsx";

const statesData = statesJSON as FeatureCollection<Geometry, StateProps>;
const countiesData = countiesJSON as FeatureCollection<Geometry, CountyProps>;
// const censusBlockData = censusBlockDataJSON as CensusBlockData[];

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

// Mail Ballots Rejected Data
const mailBallotsRejectedData = mailBallotsRejectedDataJson as {
  eavsRegion: string;
  C9b: number;
  C9c: number;
  C9d: number;
  C9e: number;
  C9f: number;
  C9g: number;
  C9h: number;
  C9i: number;
  C9j: number;
  C9k: number;
  C9l: number;
  C9m: number;
  C9n: number;
  C9o: number;
  C9p: number;
  C9q: number;
  notes: string;
}[];

// Drop box voting data type
type DropBoxVotingData = {
  eavsRegion: string;
  totalDropBoxVotes: number;
  republicanVotes: number;
  democraticVotes: number;
  otherVotes: number;
  totalVotes: number;
  republicanPercentage: number;
  dropBoxPercentage: number;
  dominantParty: "republican" | "democratic";
};

const AnalysisType = {
  PROVISIONAL_BALLOT: "prov-ballot-bchart",
  ACTIVE_VOTERS_2024: "active-voters-2024",
  POLLBOOK_DELETIONS_2024: "pb-deletions-2024",
  MAIL_BALLOTS_REJECTED: "mail-balots-rejected",
  VOTER_REGISTRATION: "voter-registration",
  STATE_EQUIPMENT_SUMMARY: "state-equip-summary",
  DROP_BOX_VOTING: "drop-box-voting",
  EQUIPMENT_QUALITY_VS_REJECTED_BALLOTS:
    "equipment-quality-vs-rejected-ballots",
} as const;

type AnalysisTypeValue = (typeof AnalysisType)[keyof typeof AnalysisType];

const analysisTypeLabels: Record<AnalysisTypeValue, string> = {
  [AnalysisType.PROVISIONAL_BALLOT]: "Provisional Ballots",
  [AnalysisType.ACTIVE_VOTERS_2024]: "2024 EAVS Active Voters",
  [AnalysisType.POLLBOOK_DELETIONS_2024]: "2024 EAVS Pollbook Deletions",
  [AnalysisType.MAIL_BALLOTS_REJECTED]: "Mail Ballots Rejected",
  [AnalysisType.VOTER_REGISTRATION]: "Voter Registration",
  [AnalysisType.STATE_EQUIPMENT_SUMMARY]: "State Equipment Summary",
  [AnalysisType.DROP_BOX_VOTING]: "Drop Box Voting",
  [AnalysisType.EQUIPMENT_QUALITY_VS_REJECTED_BALLOTS]:
    "Equipment vs Rejected Ballots",
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
  [AnalysisType.STATE_EQUIPMENT_SUMMARY]: STATE_CHOROPLETH_OPTIONS.OFF,
  [AnalysisType.DROP_BOX_VOTING]: STATE_CHOROPLETH_OPTIONS.OFF,
  [AnalysisType.EQUIPMENT_QUALITY_VS_REJECTED_BALLOTS]:
    STATE_CHOROPLETH_OPTIONS.OFF,
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
  const normalizedStateKey = useMemo(
    () => stateName.toLowerCase().replace(/\s+/g, "-"),
    [stateName],
  );

  const formattedStateName = useMemo(
    () => formatStateName(stateName),
    [stateName],
  );

  const stateFipsPrefix = useMemo(
    () => getStateFipsCode(formattedStateName),
    [formattedStateName],
  );

  const isDetailedState = useMemo(
    () => Object.keys(DETAILED_STATES).includes(normalizedStateKey),
    [normalizedStateKey],
  );

  const stateDetails = useMemo(
    () => getStateDetails(normalizedStateKey),
    [normalizedStateKey],
  );

  const isPoliticalPartyState = stateDetails?.politicalPartyState ?? false;

  // Set choropleth option based on selected dataset, but only for detailed states
  const choroplethOption = useMemo(() => {
    if (!isDetailedState) {
      return STATE_CHOROPLETH_OPTIONS.OFF;
    }

    // For voter registration, only show choropleth if state has detailed voter data
    if (
      selectedDataset === AnalysisType.VOTER_REGISTRATION &&
      !hasDetailedVoterData(normalizedStateKey)
    ) {
      return STATE_CHOROPLETH_OPTIONS.OFF;
    }

    return analysisToChoroplethMap[selectedDataset];
  }, [isDetailedState, selectedDataset, normalizedStateKey]);

  const handleBackToMainMap = () => {
    navigate({ to: "/" });
  };

  // Get available analysis options based on state capabilities
  const availableAnalysisOptions = useMemo<AnalysisTypeValue[]>(
    () =>
      Object.values(AnalysisType).filter((option) => {
        if (option === AnalysisType.DROP_BOX_VOTING) {
          return hasDropBoxVoting(normalizedStateKey);
        }
        return true;
      }),
    [normalizedStateKey],
  );

  function formatStateName(stateName: string): string {
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
  }

  // Filter states data to only include the current state
  const getCurrentStateData = (): FeatureCollection<Geometry, StateProps> => {
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
    if (!isDetailedState) {
      return null;
    }

    const stateFips = stateFipsPrefix;

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
  const detailedState = isDetailedState;

  const urlStateName = normalizedStateKey;
  const showBubbleChart =
    selectedDataset === AnalysisType.VOTER_REGISTRATION &&
    hasDetailedVoterData(urlStateName);

  // Get drop box voting data for current state
  const getDropBoxVotingData = (): DropBoxVotingData[] => {
    const stateKey = normalizedStateKey as keyof typeof dropBoxVotingDataJson;
    return (dropBoxVotingDataJson[stateKey] || []) as DropBoxVotingData[];
  };

  // Get equipment quality data for current state
  const getEquipmentQualityData = () => {
    // The JSON has the structure: { equipmentQualityData: [...], regressionCoefficients: {...} }
    // Provided JSON is for Arizona (based on counties)
    // TODO: Adjust to state specific data
    return {
      data: (equipmentQualityDataJson.equipmentQualityData || []) as {
        county: string;
        equipmentQuality: number;
        rejectedBallotPercentage: number;
        totalBallots: number;
        rejectedBallots: number;
        dominantParty: "republican" | "democratic";
        mailInRejected: number;
        provisionalRejected: number;
        uocavaRejected: number;
      }[],
      regressionCoefficients:
        equipmentQualityDataJson.regressionCoefficients as {
          republican: { a: number; b: number; c: number };
          democratic: { a: number; b: number; c: number };
        },
    };
  };

  const activeVotersData = useMemo(() => {
    if (normalizedStateKey === "california") {
      return activeVotersDataCaliforniaJson;
    } else if (normalizedStateKey === "florida") {
      return activeVotersDataFloridaJson;
    }
    return activeVotersDataJson;
  }, [normalizedStateKey]);

  const {
    data: provAggregateData,
    isPending: provLoading,
    isError: provAggregateHasError,
    error: provAggregateError,
  } = useProvisionalAggregateQuery(stateFipsPrefix);

  const {
    data: provStateData,
    isPending: provStateLoading,
    isError: provStateHasError,
    error: provStateError,
  } = useProvisionalStateQuery(stateFipsPrefix);

  const provChartData: ProvisionBallotsData[] = useMemo(() => {
    if (!provAggregateData) {
      return [];
    }

    return [
      {
        E2a: provAggregateData.E2a ?? 0,
        E2b: provAggregateData.E2b ?? 0,
        E2c: provAggregateData.E2c ?? 0,
        E2d: provAggregateData.E2d ?? 0,
        E2e: provAggregateData.E2e ?? 0,
        E2f: provAggregateData.E2f ?? 0,
        E2g: provAggregateData.E2g ?? 0,
        E2h: provAggregateData.E2h ?? 0,
        E2i: provAggregateData.E2i ?? 0,
        Other: provAggregateData.Other ?? 0,
      },
    ];
  }, [provAggregateData]);

  const provErrorMessage = provAggregateHasError
    ? (provAggregateError?.message ?? "Unknown error")
    : null;

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
        <div className="w-64 bg-gray-50 border-r p-4 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Select Dataset
          </p>
          <div className="space-y-1.5">
            {availableAnalysisOptions.map((analysisType) => (
              <Button
                key={analysisType}
                variant={
                  selectedDataset === analysisType ? "default" : "outline"
                }
                className="w-full justify-start text-sm h-10 font-normal"
                onClick={() => setSelectedDataset(analysisType)}
              >
                {analysisTypeLabels[analysisType]}
              </Button>
            ))}
          </div>
        </div>

        {/* Middle - Map */}
        <div className="w-[30%] relative flex-shrink-0">
          <StateMap
            currentStateData={currentStateData}
            currentCountiesData={currentCountiesData}
            isDetailedState={detailedState}
            choroplethOption={choroplethOption}
            // censusBlockData={censusBlockData}
            showBubbleChart={showBubbleChart}
            showCvapLegend={isPoliticalPartyState}
            cvapLegendData={activeVotersData}
            hasDetailedVoterData={hasDetailedVoterData(normalizedStateKey)}
          />
        </div>

        {/* Right - Analysis Content */}
        <div className="flex-1 bg-white border-l min-w-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">
              {analysisTypeLabels[selectedDataset]}
            </h2>
            <div className="mt-4">
              {selectedDataset === AnalysisType.VOTER_REGISTRATION ? (
                <div>
                  {hasDetailedVoterData(normalizedStateKey) && (
                    <VoterRegistrationTable data={eavsRegionVoterData} />
                  )}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-900">
                      Changes in Voter Registration by County
                    </h3>
                    <div className="h-[350px]">
                      <VoterRegistrationLineChart
                        data={voterRegistrationData}
                      />
                    </div>
                  </div>
                </div>
              ) : selectedDataset === AnalysisType.STATE_EQUIPMENT_SUMMARY ? (
                <div className="h-full">
                  <StateEquipmentSummaryTable
                    data={stateEquipmentSummaryJson as StateEquipmentSummary[]}
                  />
                </div>
              ) : selectedDataset === AnalysisType.PROVISIONAL_BALLOT ? (
                <div className="text-xs text-muted-foreground text-center">
                  {provLoading ? (
                    <p>Loading provisional ballot data...</p>
                  ) : provErrorMessage ? (
                    <p className="py-8">
                      Error loading {stateName} data: {provErrorMessage}
                    </p>
                  ) : (
                    <>
                      <ProvisionBallotsTable
                        data={provStateData}
                        isPending={provStateLoading}
                        isError={provStateHasError}
                        error={provStateError}
                      />
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
                          Provisional Ballots by Reason -{" "}
                          {formatStateName(stateName)}
                        </h3>
                        <ProvisionalBallotsBarChart
                          stateName={formatStateName(stateName)}
                          barData={provChartData}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : selectedDataset === AnalysisType.ACTIVE_VOTERS_2024 ? (
                <div className="text-xs text-muted-foreground text-center">
                  <ActiveVotersTable data={activeVotersData} />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
                      Active Voters Status - {formatStateName(stateName)}
                    </h3>
                    <ActiveVotersBarChart
                      stateName={formatStateName(stateName)}
                      barData={activeVotersData}
                    />
                  </div>
                </div>
              ) : selectedDataset === AnalysisType.DROP_BOX_VOTING ? (
                <div className="h-[600px]">
                  <DropBoxVotingBubbleChart
                    stateName={formatStateName(stateName)}
                    data={getDropBoxVotingData()}
                  />
                </div>
              ) : selectedDataset ===
                AnalysisType.EQUIPMENT_QUALITY_VS_REJECTED_BALLOTS ? (
                <div className="h-[600px]">
                  <EquipmentQualityBubbleChart
                    stateName={formatStateName(stateName)}
                    data={getEquipmentQualityData().data}
                    regressionCoefficients={
                      getEquipmentQualityData().regressionCoefficients
                    }
                  />
                </div>
              ) : selectedDataset === AnalysisType.POLLBOOK_DELETIONS_2024 ? (
                <div className="text-xs text-muted-foreground text-center">
                  <ActiveVotersTable data={activeVotersData} />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
                      Pollbook Deletions by Reason -{" "}
                      {formatStateName(stateName)}
                    </h3>
                    <PollbookDeletionsBarChart
                      stateName={formatStateName(stateName)}
                      barData={pollbookDeletionsDataJson}
                    />
                  </div>
                </div>
              ) : selectedDataset === AnalysisType.MAIL_BALLOTS_REJECTED ? (
                <div className="text-xs text-muted-foreground text-center">
                  <MailBallotsRejectedTable data={mailBallotsRejectedData} />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
                      Mail Ballots Rejected by Reason -{" "}
                      {formatStateName(stateName)}
                    </h3>
                    <MailBallotsRejectedBarChart
                      stateName={formatStateName(stateName)}
                      barData={mailBallotsRejectedData}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
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
