import type { ColumnDef, Row } from "@tanstack/react-table";

export type ProvisionalTableRow = {
  eavsRegion: string;
  totalProv: number;
  provCountFullyCounted: number;
  provCountPartialCounted: number;
  provRejected: number;
  provisionalOtherStatus: number;
};

const METRIC_KEYS = [
  "totalProv",
  "provCountFullyCounted",
  "provCountPartialCounted",
  "provRejected",
  "provisionalOtherStatus",
] as const;

export const createProvisionalBallotsColumns = (
  metricLabels: Record<string, string>,
): ColumnDef<ProvisionalTableRow>[] => [
  {
    accessorKey: "eavsRegion",
    header: () => <div className="text-left font-semibold">Region</div>,
    cell: ({ row }: { row: Row<ProvisionalTableRow> }) => {
      const isTotal = row.original.eavsRegion === "TOTAL";
      return (
        <div
          className={`text-sm text-left py-0 px-0 ${isTotal ? "font-bold text-black" : "text-black font-medium"}`}
        >
          {row.original.eavsRegion}
        </div>
      );
    },
  },
  ...METRIC_KEYS.map((key) => ({
    id: key,
    header: () => <div className="text-right">{metricLabels[key] || key}</div>,
    cell: ({ row }: { row: Row<ProvisionalTableRow> }) => {
      const isTotal = row.original.eavsRegion === "TOTAL";
      const value = row.original[key] ?? 0;
      return (
        <div
          className={`text-sm text-right ${isTotal ? "font-bold text-black" : "text-black"}`}
        >
          {value.toLocaleString()}
        </div>
      );
    },
  })),
];
