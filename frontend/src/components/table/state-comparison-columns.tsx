import type { ColumnDef } from "@tanstack/react-table";

export type StateComparisonRow = {
  metric: string;
  republicanValue: string | number;
  democraticValue: string | number;
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
    header: "Republican State",
    cell: ({ row }) => <div>{row.getValue("republicanValue")}</div>,
  },
  {
    accessorKey: "democraticValue",
    header: "Democratic State",
    cell: ({ row }) => <div>{row.getValue("democraticValue")}</div>,
  },
];
