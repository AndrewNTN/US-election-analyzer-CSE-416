import type { ColumnDef, Row } from "@tanstack/react-table";

export interface ActiveVotersData {
  eavsRegion: string;
  activeVoters: number;
  totalVoters: number;
  inactiveVoters: number;
  cvap2023?: number; // 2023 ACS CVAP (Citizen Voting Age Population)
  registrationRate?: number; // Percentage of CVAP registered (totalVoters / cvap2023 * 100)
  notes: string;
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
  {
    accessorKey: "cvap2023",
    header: () => <div className="text-right">2023 CVAP</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => {
      const value = row.getValue("cvap2023") as number | undefined;
      if (value === undefined)
        return <div className="text-sm text-right text-gray-400">N/A</div>;
      return (
        <div className="text-sm text-right text-black">
          {value.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "registrationRate",
    header: () => <div className="text-right">CVAP Reg. Rate</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => {
      const value = row.getValue("registrationRate") as number | undefined;
      if (value === undefined)
        return <div className="text-sm text-right text-gray-400">N/A</div>;

      return (
        <div className="text-sm text-right text-black">{value.toFixed(1)}%</div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: () => <div className="text-left">Notes</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-left text-black">
        {row.getValue("notes")}
      </div>
    ),
  },
];
