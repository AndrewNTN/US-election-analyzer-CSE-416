import type { ColumnDef } from "@tanstack/react-table";

// Sample Voters Table
export interface SampleVoterRow {
  id: string;
  name: string;
  email: string;
  party: string;
  zip: string;
  registered: string | boolean;
  mailInVote: boolean;
}

export const sampleVotersColumns: ColumnDef<SampleVoterRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "party",
    header: "Party",
  },
];
