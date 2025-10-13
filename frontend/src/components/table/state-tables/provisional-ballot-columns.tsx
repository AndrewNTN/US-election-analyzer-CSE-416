import type { ColumnDef, Row } from "@tanstack/react-table";

export interface ProvisionBallotsData {
  region: string;
  metrics: Record<string, number>;
}

const metricKeys = [
  "E1a", // Total Provisional Ballots Cast
  "E1b", // Provisional Ballots Fully Counted
  "E1c", // Provisional Ballots Partially Counted
  "E1d", // Provisional Ballots Rejected
  "E1e", // Provisional Ballots Other Status
] as const;

const columnHeaders = {
  E1a: "Ballots Cast",
  E1b: "Fully Counted",
  E1c: "Partially Counted",
  E1d: "Rejected",
  E1e: "Other Status",
} as const;

export const provisionalBallotsColumns: ColumnDef<ProvisionBallotsData>[] = [
  {
    accessorKey: "region",
    header: () => <div className="text-left font-semibold">Region</div>,
    cell: ({ row }: { row: Row<ProvisionBallotsData> }) => (
      <div className="text-sm text-left text-black font-medium py-0 px-0">
        {row.getValue("region")}
      </div>
    ),
  },
  ...metricKeys.map((key) => ({
    id: key,
    header: () => <div className="text-right">{columnHeaders[key]}</div>,
    cell: ({ row }: { row: Row<ProvisionBallotsData> }) => {
      const metrics = row.original.metrics;
      return (
        <div className="text-sm text-right text-black">
          {metrics?.[key]?.toLocaleString?.() ?? "0"}
        </div>
      );
    },
  })),
];
