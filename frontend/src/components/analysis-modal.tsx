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
import { StateComparisonTable } from "@/components/table/state-comparison-table.tsx";
import { OptInOptOutTable } from "@/components/table/opt-in-opt-out-table.tsx";
import { EarlyVotingTable } from "@/components/table/early-voting-table.tsx";
import votingEquipmentDataJson from "../../data/votingEquipment.json" with { type: "json" };
import {
  stateComparisonData,
  republicanStateName,
  democraticStateName,
} from "@/lib/state-comparison-data.ts";
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

const votingEquipmentData: VotingEquipment[] =
  votingEquipmentDataJson as VotingEquipment[];

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
  const renderContent = () => {
    if (!selectedAnalysis) return null;
    switch (selectedAnalysis.title) {
      case AnalysisOption.US_VOTING_EQUIPMENT:
        return <VotingEquipmentTable data={votingEquipmentData} />;
      case AnalysisOption.EQUIPMENT_SUMMARY:
        return <EquipmentSummaryTable />;
      case AnalysisOption.REPUBLICAN_VS_DEMOCRATIC:
        return (
          <StateComparisonTable
            data={stateComparisonData}
            republicanState={republicanStateName}
            democraticState={democraticStateName}
          />
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto min-w-[60vw] max-h-[90vh] max-w-[95vw] flex flex-col p-5">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl">
            {selectedAnalysis?.title}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {selectedAnalysis?.description}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto overflow-x-hidden flex-1">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
