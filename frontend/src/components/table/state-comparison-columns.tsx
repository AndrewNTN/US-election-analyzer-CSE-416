import type { ColumnDef } from "@tanstack/react-table";

export type StateComparisonRow = {
  metric: string;
  republicanValue: string;
  democraticValue: string;
};

export const getStateComparisonColumns = (
  republicanState: string,
  democraticState: string,
): ColumnDef<StateComparisonRow>[] => [
  {
    accessorKey: "metric",
    header: "Metric",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("metric")}</div>
    ),
  },
  {
    accessorKey: "republicanValue",
    header: () => <div className="text-center">{republicanState} (R)</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("republicanValue")}</div>
    ),
  },
  {
    accessorKey: "democraticValue",
    header: () => <div className="text-center">{democraticState} (D)</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("democraticValue")}</div>
    ),
  },
];
