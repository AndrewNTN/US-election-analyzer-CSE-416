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
    header: "DRE (No VVPAT)",
    cell: ({ row }) => {
      const value = row.getValue("dreNoVVPAT") as number;
      return <div>{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "dreWithVVPAT",
    header: "DRE (With VVPAT)",
    cell: ({ row }) => {
      const value = row.getValue("dreWithVVPAT") as number;
      return <div>{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "ballotMarkingDevice",
    header: "Ballot Marking Device",
    cell: ({ row }) => {
      const value = row.getValue("ballotMarkingDevice") as number;
      return <div>{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "scanner",
    header: "Scanner",
    cell: ({ row }) => {
      const value = row.getValue("scanner") as number;
      return <div>{value.toLocaleString()}</div>;
    },
  },
];
