import type { ColumnDef, Row } from "@tanstack/react-table";

export interface ProvisionBallotsData {
  E2a: number;
  E2b: number;
  E2c: number;
  E2d: number;
  E2e: number;
  E2f: number;
  E2g: number;
  E2h: number;
  E2i: string;
  // add other fields if needed
}

export const provisionalBallotsColumns: ColumnDef<ProvisionBallotsData>[] = [
  ...(["E2a", "E2b", "E2c", "E2d", "E2e", "E2f", "E2g", "E2h"] as const).map(
    (key) => ({
      accessorKey: key,
      header: () => <div className="text-right">{key.toUpperCase()}</div>,
      cell: ({ row }: { row: Row<ProvisionBallotsData> }) => (
        <div className="text-xs text-right text-black">{row.getValue(key)}</div>
      ),
    }),
  ),
  {
    accessorKey: "E2i",
    header: () => <div className="text-left">E2I</div>,
    cell: ({ row }: { row: Row<ProvisionBallotsData> }) => (
      <div className="text-xs text-left text-black">{row.getValue("E2i")}</div>
    ),
  },
];
