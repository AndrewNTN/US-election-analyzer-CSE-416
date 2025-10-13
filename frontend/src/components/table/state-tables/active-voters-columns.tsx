import type { ColumnDef, Row } from "@tanstack/react-table";

export interface ActiveVotersData {
  eavsRegion: string;
  activeVoters: number;
  totalVoters: number;
  inactiveVoters: number;
  registrationRate?: number; // Percentage of CVAP registered (totalVoters / cvap2023 * 100)
  notes?: string;
}

export const activeVotersColumns: ColumnDef<ActiveVotersData>[] = [
  {
    accessorKey: "eavsRegion",
    header: () => <div className="text-left">EAVS Region</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-left text-black font-medium">
        {row.getValue("eavsRegion")}
      </div>
    ),
  },
  {
    accessorKey: "activeVoters",
    header: () => <div className="text-right">Active Voters</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-right text-black">
        {(row.getValue("activeVoters") as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "totalVoters",
    header: () => <div className="text-right">Total Voters</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-right text-black">
        {(row.getValue("totalVoters") as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "inactiveVoters",
    header: () => <div className="text-right">Inactive Voters</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-right text-black">
        {(row.getValue("inactiveVoters") as number).toLocaleString()}
      </div>
    ),
  },
];
