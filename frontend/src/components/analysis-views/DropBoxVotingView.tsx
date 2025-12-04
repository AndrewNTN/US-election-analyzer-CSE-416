import { DropBoxVotingBubbleChart } from "../chart/drop-box-voting-bubble-chart";
import { useDropBoxVotingDataQuery } from "@/lib/api/use-queries";

interface DropBoxVotingViewProps {
  stateFipsPrefix: string | undefined;
}

export function DropBoxVotingView({ stateFipsPrefix }: DropBoxVotingViewProps) {
  const { data } = useDropBoxVotingDataQuery(stateFipsPrefix);

  return (
    <div className="h-[600px]">
      <DropBoxVotingBubbleChart data={data || []} />
    </div>
  );
}
