import { DropBoxVotingBubbleChart } from "../chart/drop-box-voting-bubble-chart";
import { useDropBoxVotingDataQuery } from "@/lib/api/use-queries";

interface DropBoxVotingViewProps {
  stateFipsPrefix: string;
  stateName: string;
}

export function DropBoxVotingView({
  stateFipsPrefix,
  stateName,
}: DropBoxVotingViewProps) {
  const { data } = useDropBoxVotingDataQuery(stateFipsPrefix);

  return (
    <div className="h-[600px]">
      <DropBoxVotingBubbleChart stateName={stateName} data={data || []} />
    </div>
  );
}
