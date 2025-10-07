import type { ColumnDef } from "@tanstack/react-table";

export type VotingEquipment = {
  state: string;
  dreNoVVPAT: number;
  dreWithVVPAT: number;
  ballotMarkingDevice: number;
  scanner: number;
};

export const votingEquipmentColumns: ColumnDef<VotingEquipment>[] = [
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("state")}</div>
    ),
  },
  {
    accessorKey: "dreNoVVPAT",
    header: () => <div className="text-right">DRE (No VVPAT)</div>,
    cell: ({ row }) => {
      const value = row.getValue("dreNoVVPAT") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "dreWithVVPAT",
    header: () => <div className="text-right">DRE (With VVPAT)</div>,
    cell: ({ row }) => {
      const value = row.getValue("dreWithVVPAT") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "ballotMarkingDevice",
    header: () => <div className="text-right">Ballot Marking Device</div>,
    cell: ({ row }) => {
      const value = row.getValue("ballotMarkingDevice") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "scanner",
    header: () => <div className="text-right">Scanner</div>,
    cell: ({ row }) => {
      const value = row.getValue("scanner") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
];
