import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useStatesGeoJsonQuery,
  useCountiesGeoJsonQuery,
} from "@/lib/api/use-queries.ts";
import type { CountyProps, StateProps } from "@/lib/api/geojson-requests";
import {
  DETAILED_STATES,
  getStateDetails,
  hasDetailedVoterData,
  hasDropBoxVoting,
} from "@/constants/states.ts";
import { getStateFipsCode } from "@/constants/stateFips.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  STATE_CHOROPLETH_OPTIONS,
  type StateChoroplethOption,
} from "@/lib/choropleth.ts";
import StateMap from "@/components/map/state-map.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import { MapLoading } from "@/components/ui/map-loading";
import { MapError } from "@/components/ui/map-error";

// View Components
import { VoterRegistrationView } from "@/components/analysis-views/VoterRegistrationView";
import { StateEquipmentSummaryView } from "@/components/analysis-views/StateEquipmentSummaryView";
import { ProvisionalBallotView } from "@/components/analysis-views/ProvisionalBallotView";
import { ActiveVotersView } from "@/components/analysis-views/ActiveVotersView";
import { DropBoxVotingView } from "@/components/analysis-views/DropBoxVotingView";
import { EquipmentQualityView } from "@/components/analysis-views/EquipmentQualityView";
import { PollbookDeletionsView } from "@/components/analysis-views/PollbookDeletionsView";
import { MailBallotsRejectedView } from "@/components/analysis-views/MailBallotsRejectedView";

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

    return analysisToChoroplethMap[selectedDataset];
  }, [isDetailedState, selectedDataset]);

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

  const {
    data: allStatesData,
    isLoading: isLoadingStates,
    isError: isErrorStates,
    refetch: refetchStates,
  } = useStatesGeoJsonQuery();
  const {
    data: stateCountiesData,
    isLoading: isLoadingCounties,
    isError: isErrorCounties,
    refetch: refetchCounties,
  } = useCountiesGeoJsonQuery(stateFipsPrefix);

  const isLoading = isLoadingStates || (isDetailedState && isLoadingCounties);
  const isError = isErrorStates || (isDetailedState && isErrorCounties);

  // Filter states data to only include the current state
  const currentStateData = useMemo((): FeatureCollection<
    Geometry,
    StateProps
  > => {
    if (!allStatesData || !normalizedStateKey) {
      return { type: "FeatureCollection", features: [] };
    }

    const features = allStatesData.features.filter(
      (feature) =>
        feature.properties.stateName?.toLowerCase().replace(/\s+/g, "-") ===
        normalizedStateKey,
    );

    return {
      type: "FeatureCollection",
      features,
    };
  }, [allStatesData, normalizedStateKey]);

  // Memoize the current counties data to ensure stable reference for map component
  const currentCountiesData = useMemo((): FeatureCollection<
    Geometry,
    CountyProps
  > | null => {
    if (!isDetailedState || !stateCountiesData) {
      return null;
    }
    return stateCountiesData;
  }, [isDetailedState, stateCountiesData]);

  const detailedState = isDetailedState;

  const showBubbleChart =
    selectedDataset === AnalysisType.VOTER_REGISTRATION &&
    hasDetailedVoterData(normalizedStateKey);

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
          {isLoading ? (
            <MapLoading />
          ) : isError ? (
            <MapError
              onRetry={() => {
                refetchStates();
                if (isDetailedState) {
                  refetchCounties();
                }
              }}
            />
          ) : (
            <StateMap
              currentStateData={currentStateData}
              currentCountiesData={currentCountiesData}
              isDetailedState={detailedState}
              choroplethOption={choroplethOption}
              showBubbleChart={showBubbleChart}
              showCvapLegend={isPoliticalPartyState}
              fipsPrefix={stateFipsPrefix}
              hasDetailedVoterData={hasDetailedVoterData(normalizedStateKey)}
            />
          )}
        </div>

        {/* Right - Analysis Content */}
        <div className="flex-1 bg-white border-l min-w-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">
              {analysisTypeLabels[selectedDataset]}
            </h2>
            <div className="mt-4">
              {selectedDataset === AnalysisType.VOTER_REGISTRATION ? (
                <VoterRegistrationView
                  normalizedStateKey={normalizedStateKey}
                  stateFips={stateFipsPrefix}
                />
              ) : selectedDataset === AnalysisType.STATE_EQUIPMENT_SUMMARY ? (
                <StateEquipmentSummaryView />
              ) : selectedDataset === AnalysisType.PROVISIONAL_BALLOT ? (
                <ProvisionalBallotView
                  stateFipsPrefix={stateFipsPrefix}
                  stateName={formatStateName(stateName)}
                />
              ) : selectedDataset === AnalysisType.ACTIVE_VOTERS_2024 ? (
                <ActiveVotersView
                  stateName={formatStateName(stateName)}
                  stateFipsPrefix={stateFipsPrefix}
                />
              ) : selectedDataset === AnalysisType.DROP_BOX_VOTING ? (
                <DropBoxVotingView
                  normalizedStateKey={normalizedStateKey}
                  stateName={formatStateName(stateName)}
                />
              ) : selectedDataset ===
                AnalysisType.EQUIPMENT_QUALITY_VS_REJECTED_BALLOTS ? (
                <EquipmentQualityView stateName={formatStateName(stateName)} />
              ) : selectedDataset === AnalysisType.POLLBOOK_DELETIONS_2024 ? (
                <PollbookDeletionsView stateName={formatStateName(stateName)} />
              ) : selectedDataset === AnalysisType.MAIL_BALLOTS_REJECTED ? (
                <MailBallotsRejectedView
                  stateName={formatStateName(stateName)}
                />
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
