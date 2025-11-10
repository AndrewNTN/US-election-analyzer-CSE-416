import type { ColumnDef } from "@tanstack/react-table";

export type EarlyVotingRow = {
  metric: string;
  republicanValue: string | number;
  democraticValue: string | number;
};

export const getEarlyVotingColumns = (
  republicanState: string,
  democraticState: string,
): ColumnDef<EarlyVotingRow>[] => [
  {
    accessorKey: "metric",
    header: "Metric",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("metric")}</div>
    ),
  },
  {
    accessorKey: "republicanValue",
    header: () => <div className="text-right">{republicanState} (R)</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("republicanValue")}</div>
    ),
  },
  {
    accessorKey: "democraticValue",
    header: () => <div className="text-right">{democraticState} (D)</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("democraticValue")}</div>
    ),
  },
];
