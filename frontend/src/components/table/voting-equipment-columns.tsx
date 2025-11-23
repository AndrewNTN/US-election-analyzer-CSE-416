import type { ColumnDef } from "@tanstack/react-table";

export type VotingEquipment = {
  state: string;
  stateFips: string;
  dreNoVVPAT: number;
  dreWithVVPAT: number;
  ballotMarkingDevice: number;
  scanner: number;
};

export const createVotingEquipmentColumns = (
  metricLabels?: Record<string, string>,
): ColumnDef<VotingEquipment>[] => [
  {
    accessorKey: "state",
    header: metricLabels?.state || "State",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("state")}</div>
    ),
  },
  {
    accessorKey: "dreNoVVPAT",
    header: () => (
      <div className="text-right">
        {metricLabels?.dreNoVVPAT || "DRE (No VVPAT)"}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("dreNoVVPAT") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "dreWithVVPAT",
    header: () => (
      <div className="text-right">
        {metricLabels?.dreWithVVPAT || "DRE (With VVPAT)"}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("dreWithVVPAT") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "ballotMarkingDevice",
    header: () => (
      <div className="text-right">
        {metricLabels?.ballotMarkingDevice || "Ballot Marking Device"}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("ballotMarkingDevice") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "scanner",
    header: () => (
      <div className="text-right">{metricLabels?.scanner || "Scanner"}</div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("scanner") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
];

// Keep backward compatibility
export const votingEquipmentColumns = createVotingEquipmentColumns();
