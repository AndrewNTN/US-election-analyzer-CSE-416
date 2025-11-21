import { DropBoxVotingBubbleChart } from "../chart/drop-box-voting-bubble-chart";
import dropBoxVotingDataJson from "../../../data/dropBoxVotingData.json" with { type: "json" };

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

interface DropBoxVotingViewProps {
  normalizedStateKey: string;
  stateName: string;
}

export function DropBoxVotingView({
  normalizedStateKey,
  stateName,
}: DropBoxVotingViewProps) {
  // Get drop box voting data for current state
  const getDropBoxVotingData = (): DropBoxVotingData[] => {
    const stateKey = normalizedStateKey as keyof typeof dropBoxVotingDataJson;
    return (dropBoxVotingDataJson[stateKey] || []) as DropBoxVotingData[];
  };

  return (
    <div className="h-[600px]">
      <DropBoxVotingBubbleChart
        stateName={stateName}
        data={getDropBoxVotingData()}
      />
    </div>
  );
}
