import type { ColumnDef } from "@tanstack/react-table";

export type StateComparisonRow = {
  metric: string;
  republicanValue: string;
  democraticValue: string;
};

export const stateComparisonColumns: ColumnDef<StateComparisonRow>[] = [
  {
    accessorKey: "metric",
    header: "Metric",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("metric")}</div>
    ),
  },
  {
    accessorKey: "republicanValue",
    header: () => <div className="text-right">Republican State</div>,
    cell: ({ row }) => (
      <div className="px-2 text-right">{row.getValue("republicanValue")}</div>
    ),
  },
  {
    accessorKey: "democraticValue",
    header: () => <div className="text-right">Democratic State</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("democraticValue")}</div>
    ),
  },
];
