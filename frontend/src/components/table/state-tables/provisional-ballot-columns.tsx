import type { ColumnDef, Row } from "@tanstack/react-table";
import type { ProvisionalTableResponse } from "@/lib/api/eavs-requests.ts";

const METRICS = [
  { key: "totalProv", label: "Ballots Cast" },
  { key: "provCountFullyCounted", label: "Fully Counted" },
  { key: "provCountPartialCounted", label: "Partially Counted" },
  { key: "provRejected", label: "Rejected" },
  { key: "provisionalOtherStatus", label: "Other" },
] as const;

export const provisionalBallotsColumns: ColumnDef<ProvisionalTableResponse>[] =
  [
    {
      accessorKey: "jurisdictionName",
      header: () => <div className="text-left font-semibold">Region</div>,
      cell: ({ row }: { row: Row<ProvisionalTableResponse> }) => {
        const isTotal = row.getValue("jurisdictionName") === "TOTAL";
        return (
          <div
            className={`text-sm text-left py-0 px-0 ${isTotal ? "font-bold text-black" : "text-black font-medium"}`}
          >
            {row.getValue("jurisdictionName")}
          </div>
        );
      },
    },
    ...METRICS.map((metric) => ({
      id: metric.key,
      header: () => <div className="text-right">{metric.label}</div>,
      cell: ({ row }: { row: Row<ProvisionalTableResponse> }) => {
        const isTotal = row.getValue("jurisdictionName") === "TOTAL";
        const value = row.original[metric.key] ?? 0;
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
