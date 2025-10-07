import type { ColumnDef } from "@tanstack/react-table";

export type OptInOptOutRow = {
  metric: string;
  optInValue: string | number;
  optOutWithSameDayValue: string | number;
  optOutWithoutSameDayValue: string | number;
};

export const optInOptOutColumns: ColumnDef<OptInOptOutRow>[] = [
  {
    accessorKey: "metric",
    header: "Metric",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("metric")}</div>
    ),
  },
  {
    accessorKey: "optInValue",
    header: "Opt-in State",
    cell: ({ row }) => <div>{row.getValue("optInValue")}</div>,
  },
  {
    accessorKey: "optOutWithSameDayValue",
    header: "Opt-out (Same-Day)",
    cell: ({ row }) => <div>{row.getValue("optOutWithSameDayValue")}</div>,
  },
  {
    accessorKey: "optOutWithoutSameDayValue",
    header: "Opt-out (No Same-Day)",
    cell: ({ row }) => <div>{row.getValue("optOutWithoutSameDayValue")}</div>,
  },
];
