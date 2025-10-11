import type { ColumnDef, Row } from "@tanstack/react-table";

export interface ProvisionBallotsData {
  region: string;
  metrics: Record<string, number>;
}

const metricKeys = [
  "E2a",
  "E2b",
  "E2c",
  "E2d",
  "E2e",
  "E2f",
  "E2g",
  "E2h",
  "E2i",
] as const;

export const provisionalBallotsColumns: ColumnDef<ProvisionBallotsData>[] = [
  {
    accessorKey: "region",
    header: () => <div className="text-left font-semibold">EAVS Region</div>,
    cell: ({ row }: { row: Row<ProvisionBallotsData> }) => (
      <div className="text-xs text-left text-black font-medium py-0 px-0">
        {row.getValue("region")}
      </div>
    ),
  },
  ...metricKeys.map((key) => ({
    id: key,
    header: () => <div className="text-right">{key.toUpperCase()}</div>,
    cell: ({ row }: { row: Row<ProvisionBallotsData> }) => {
      const metrics = row.original.metrics;
      return (
        <div className="text-xs text-right text-black">
          {metrics?.[key]?.toLocaleString?.() ?? "0"}
        </div>
      );
    },
  })),
];
