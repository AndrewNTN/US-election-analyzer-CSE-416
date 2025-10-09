import type { ColumnDef, Row } from "@tanstack/react-table";

export interface ProvisionBallotsData {
  region: string; // County/Geographic region name
  E2a: number;
  E2b: number;
  E2c: number;
  E2d: number;
  E2e: number;
  E2f: number;
  E2g: number;
  E2h: number;
  E2i: number;
}

export const provisionalBallotsColumns: ColumnDef<ProvisionBallotsData>[] = [
  {
    accessorKey: "region",
    header: () => <div className="text-left font-semibold">Region</div>,
    cell: ({ row }: { row: Row<ProvisionBallotsData> }) => (
      <div className="text-xs text-left text-black font-medium py-0 px-0 max-w-3">{row.getValue("region")}</div>
    ),
  },
  ...(["E2a", "E2b", "E2c", "E2d", "E2e", "E2f", "E2g", "E2h", "E2i"] as const).map(
    (key, index, array) => ({
      accessorKey: key,
      header: () => <div className={`text-right ${index === array.length - 1 ? 'pr-4' : ''}`}>{key.toUpperCase()}</div>,
      cell: ({ row }: { row: Row<ProvisionBallotsData> }) => (
        <div className={`text-xs text-right text-black ${index === array.length - 1 ? 'pr-4' : ''}`}>
          {row.getValue(key)}
        </div>
      ),
    }),
  ),
];
