import { MailBallotsRejectedTable } from "../table/state-tables/mail-ballots-rejected-table.tsx";
import { MailBallotsRejectedBarChart } from "../chart/mail-ballots-rejected-bar-chart";
import mailBallotsRejectedDataJson from "../../../data/mailBallotsRejectedData.json" with { type: "json" };

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

interface MailBallotsRejectedViewProps {
  stateName: string;
}

export function MailBallotsRejectedView({
  stateName,
}: MailBallotsRejectedViewProps) {
  return (
    <div className="text-xs text-muted-foreground text-center">
      <MailBallotsRejectedTable data={mailBallotsRejectedData} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900">
          Mail Ballots Rejected by Reason
        </h3>
        <MailBallotsRejectedBarChart
          stateName={stateName}
          barData={mailBallotsRejectedData}
        />
      </div>
    </div>
  );
}
