import { VoterRegistrationTable } from "../table/state-tables/voter-registration-table.tsx";
import eavsRegionVoterDataJson from "../../../data/eavsRegionVoterData.json" with { type: "json" };
import { VoterRegistrationLineChart } from "../chart/voter-registration-line-chart";
import voterRegistrationDataJson from "../../../data/voterRegistrationChanges.json" with { type: "json" };
import { hasDetailedVoterData } from "@/constants/states.ts";

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

interface VoterRegistrationViewProps {
  normalizedStateKey: string;
}

export function VoterRegistrationView({ normalizedStateKey }: VoterRegistrationViewProps) {
  return (
    <div>
      {hasDetailedVoterData(normalizedStateKey) && (
        <VoterRegistrationTable data={eavsRegionVoterData} />
      )}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-900">
          Changes in Voter Registration by County
        </h3>
        <div className="h-[350px]">
          <VoterRegistrationLineChart data={voterRegistrationData} />
        </div>
      </div>
    </div>
  );
}
