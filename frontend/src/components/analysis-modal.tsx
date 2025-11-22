import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { VotingEquipmentTable } from "@/components/table/voting-equipment-table.tsx";
import type { VotingEquipment } from "@/components/table/voting-equipment-columns.tsx";
import { EquipmentSummaryTable } from "@/components/table/equipment-summary-table";
import type { EquipmentSummary } from "@/components/table/equipment-summary-columns.tsx";
import { StateComparisonTable } from "@/components/table/state-comparison-table.tsx";
import { OptInOptOutTable } from "@/components/table/opt-in-opt-out-table.tsx";
import { EarlyVotingTable } from "@/components/table/early-voting-table.tsx";
import {
  useVotingEquipmentTableQuery,
  useStateComparisonQuery,
} from "@/lib/api/use-queries.ts";
import equipmentSummaryDataJson from "../../data/equipmentSummary.json" with { type: "json" };
import {
  optInOptOutData,
  optInStateName,
  optOutWithSameDayStateName,
  optOutWithoutSameDayStateName,
} from "@/lib/opt-in-opt-out-data.ts";
import {
  earlyVotingData,
  earlyVotingRepublicanStateName,
  earlyVotingDemocraticStateName,
} from "@/lib/early-voting-data.ts";

import type { AnalysisItem } from "./analysis-drawer";

const equipmentSummaryData: EquipmentSummary[] =
  equipmentSummaryDataJson as EquipmentSummary[];

export const AnalysisOption = {
  US_VOTING_EQUIPMENT: "US Voting Equipment",
  EQUIPMENT_SUMMARY: "Equipment Summary",
  REPUBLICAN_VS_DEMOCRATIC: "Republican vs Democratic",
  OPT_IN_VS_OPT_OUT: "Opt-in vs Opt-out",
  EARLY_VOTING_COMPARISON: "Republican vs Democratic Early Voting Comparison",
  DROP_BOX_VOTING_CHART: "Drop Box Voting Chart",
  EQUIPMENT_VS_REJECTED_BALLOTS: "Equipment vs Rejected Ballots",
  POLITICAL_PARTY_BUBBLE_CHART:
    "Political Party Bubble Chart + Regression Line",
} as const;

interface AnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAnalysis: AnalysisItem | null;
}

export default function AnalysisModal({
  open,
  onOpenChange,
  selectedAnalysis,
}: AnalysisModalProps) {
  // Only query voting equipment data when US Voting Equipment analysis is selected
  const {
    data: votingEquipmentTableData,
    isLoading: isVotingEquipmentLoading,
  } = useVotingEquipmentTableQuery({
    enabled: selectedAnalysis?.title === AnalysisOption.US_VOTING_EQUIPMENT,
  });

  // Only query state comparison data when Republican vs Democratic analysis is selected
  const { data: stateComparisonData, isLoading: isStateComparisonLoading } =
    useStateComparisonQuery("12", "06", {
      enabled:
        selectedAnalysis?.title === AnalysisOption.REPUBLICAN_VS_DEMOCRATIC,
    });

  const votingEquipmentData: VotingEquipment[] =
    votingEquipmentTableData?.data || [];

  const renderContent = () => {
    if (!selectedAnalysis) return null;
    switch (selectedAnalysis.title) {
      case AnalysisOption.US_VOTING_EQUIPMENT:
        return isVotingEquipmentLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading voting equipment...</p>
          </div>
        ) : (
          <VotingEquipmentTable
            data={votingEquipmentData}
            metricLabels={votingEquipmentTableData?.metricLabels}
          />
        );
      case AnalysisOption.EQUIPMENT_SUMMARY:
        return <EquipmentSummaryTable data={equipmentSummaryData} />;
      case AnalysisOption.REPUBLICAN_VS_DEMOCRATIC:
        return isStateComparisonLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading state comparison...</p>
          </div>
        ) : stateComparisonData ? (
          <StateComparisonTable
            data={stateComparisonData.data}
            republicanState={stateComparisonData.republicanState}
            democraticState={stateComparisonData.democraticState}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        );
      case AnalysisOption.OPT_IN_VS_OPT_OUT:
        return (
          <OptInOptOutTable
            data={optInOptOutData}
            optInState={optInStateName}
            optOutWithSameDayState={optOutWithSameDayStateName}
            optOutWithoutSameDayState={optOutWithoutSameDayStateName}
          />
        );
      case AnalysisOption.EARLY_VOTING_COMPARISON:
        return (
          <EarlyVotingTable
            data={earlyVotingData}
            republicanState={earlyVotingRepublicanStateName}
            democraticState={earlyVotingDemocraticStateName}
          />
        );
      case AnalysisOption.DROP_BOX_VOTING_CHART:
        return (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Drop box voting bubble chart will be displayed here.
            </p>
          </div>
        );
      case AnalysisOption.EQUIPMENT_VS_REJECTED_BALLOTS:
        return (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Equipment vs rejected ballots analysis will be displayed here.
            </p>
          </div>
        );
      case AnalysisOption.POLITICAL_PARTY_BUBBLE_CHART:
        return (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Political party bubble chart with regression line will be
              displayed here.
            </p>
          </div>
        );
      default:
        return (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Content for {selectedAnalysis.title} will be displayed here.
            </p>
          </div>
        );
    }
  };

  // Set taller height for US Voting Equipment to accommodate bar charts
  const isVotingEquipmentAnalysis =
    selectedAnalysis?.title === AnalysisOption.US_VOTING_EQUIPMENT;
  const dialogHeightClass = isVotingEquipmentAnalysis
    ? "h-auto h-[47vw] max-h-[85vw]"
    : "h-auto max-h-[95vw]";

  // Set narrower width for comparison tables
  const isComparisonTable =
    selectedAnalysis?.title === AnalysisOption.REPUBLICAN_VS_DEMOCRATIC ||
    selectedAnalysis?.title === AnalysisOption.EARLY_VOTING_COMPARISON ||
    selectedAnalysis?.title === AnalysisOption.OPT_IN_VS_OPT_OUT;
  const dialogWidthClass = isComparisonTable
    ? "min-w-[65rem] max-w-[90%]"
    : "min-w-[77rem] max-w-[95%]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${dialogHeightClass} ${dialogWidthClass} flex flex-col p-5 w-auto`}
      >
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl">
            {selectedAnalysis?.title}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {selectedAnalysis?.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
