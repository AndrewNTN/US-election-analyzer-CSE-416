import type { ColumnDef } from "@tanstack/react-table";

export type OptInOptOutRow = {
  metric: string;
  optInValue: string | number;
  optOutWithSameDayValue: string | number;
  optOutWithoutSameDayValue: string | number;
};

export const getOptInOptOutColumns = (
  optInState: string,
  optOutWithSameDayState: string,
  optOutWithoutSameDayState: string,
): ColumnDef<OptInOptOutRow>[] => [
  {
    accessorKey: "metric",
    header: "Metric",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("metric")}</div>
    ),
  },
  {
    accessorKey: "optInValue",
    header: () => <div className="text-right">{optInState} (Opt-in)</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("optInValue")}</div>
    ),
  },
  {
    accessorKey: "optOutWithSameDayValue",
    header: () => (
      <div className="text-right">
        {optOutWithSameDayState} (Opt-out, Same-Day)
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("optOutWithSameDayValue")}</div>
    ),
  },
  {
    accessorKey: "optOutWithoutSameDayValue",
    header: () => (
      <div className="text-right">{optOutWithoutSameDayState} (Opt-out)</div>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {row.getValue("optOutWithoutSameDayValue")}
      </div>
    ),
  },
];
