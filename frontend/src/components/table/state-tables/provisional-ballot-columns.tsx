import type { ColumnDef, Row } from "@tanstack/react-table";
import type { ProvisionalTableResponse } from "@/lib/api/eavs-requests.ts";

const METRIC_KEYS = [
  "totalProv",
  "provCountFullyCounted",
  "provCountPartialCounted",
  "provRejected",
  "provisionalOtherStatus",
] as const;

export const createProvisionalBallotsColumns = (
  metricLabels: Record<string, string>,
): ColumnDef<ProvisionalTableResponse>[] => [
  {
    accessorKey: "provisionalTableData.jurisdictionName",
    header: () => <div className="text-left font-semibold">Region</div>,
    cell: ({ row }: { row: Row<ProvisionalTableResponse> }) => {
      const isTotal =
        row.original.provisionalTableData.jurisdictionName === "TOTAL";
      return (
        <div
          className={`text-sm text-left py-0 px-0 ${isTotal ? "font-bold text-black" : "text-black font-medium"}`}
        >
          {row.original.provisionalTableData.jurisdictionName}
        </div>
      );
    },
  },
  ...METRIC_KEYS.map((key) => ({
    id: key,
    header: () => <div className="text-right">{metricLabels[key] || key}</div>,
    cell: ({ row }: { row: Row<ProvisionalTableResponse> }) => {
      const isTotal =
        row.original.provisionalTableData.jurisdictionName === "TOTAL";
      const value = row.original.provisionalTableData[key] ?? 0;
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
