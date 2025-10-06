import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { VotingEquipmentTable } from "@/components/table/voting-equipment-table.tsx";
import type { VotingEquipment } from "@/components/table/voting-equipment-columns.tsx";
import { EquipmentSummaryTable } from "@/components/table/equipment-summary-table.tsx";
import type { EquipmentSummary } from "@/components/table/equipment-summary-columns.tsx";
import { StateComparisonTable } from "@/components/table/state-comparison-table.tsx";
import votingEquipmentDataJson from "../../data/votingEquipment.json" with { type: "json" };
import equipmentSummaryDataJson from "../../data/equipmentSummary.json" with { type: "json" };
import {
  stateComparisonData,
  republicanStateName,
  democraticStateName,
} from "@/lib/state-comparison-data.ts";

import type { AnalysisItem } from "./analysis-drawer";

const votingEquipmentData: VotingEquipment[] =
  votingEquipmentDataJson as VotingEquipment[];
const equipmentSummaryData: EquipmentSummary[] =
  equipmentSummaryDataJson as EquipmentSummary[];

export const AnalysisOption = {
  US_VOTING_EQUIPMENT: "US Voting Equipment",
  EQUIPMENT_SUMMARY: "Equipment Summary",
  REPUBLICAN_VS_DEMOCRATIC: "Republican vs Democratic",
  OPT_IN_VS_OPT_OUT: "Opt-in vs Opt-out",
  EARLY_VOTING_COMPARISON: "Early Voting Comparison",
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
        return <EquipmentSummaryTable data={equipmentSummaryData} />;
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
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Opt-in vs opt-out registration comparison will be displayed here.
            </p>
          </div>
        );
      case AnalysisOption.EARLY_VOTING_COMPARISON:
        return (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Early voting comparison will be displayed here.
            </p>
          </div>
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
      <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-[90vw] h-[85vh] flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl">
            {selectedAnalysis?.title}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {selectedAnalysis?.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-hidden">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
