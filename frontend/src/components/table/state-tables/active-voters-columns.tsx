import type { ColumnDef, Row } from "@tanstack/react-table";

export interface ActiveVotersData {
  jurisdiction: string;
  totalActive: number;
  totalRegistered: number;
  totalInactive: number;
  registrationRate?: number;
}

export const getActiveVotersColumns = (
  metricLabels?: Record<string, string>,
): ColumnDef<ActiveVotersData>[] => [
  {
    accessorKey: "jurisdiction",
    header: () => <div className="text-left">Region</div>,
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-left text-black font-medium">
        {row.getValue("jurisdiction")}
      </div>
    ),
  },
  {
    accessorKey: "totalRegistered",
    header: () => (
      <div className="text-right">
        {metricLabels?.totalRegistered ?? "Total Voters"}
      </div>
    ),
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-right text-black">
        {(row.getValue("totalRegistered") as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "totalActive",
    header: () => (
      <div className="text-right">
        {metricLabels?.totalActive ?? "Active Voters"}
      </div>
    ),
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-right text-black">
        {(row.getValue("totalActive") as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "totalInactive",
    header: () => (
      <div className="text-right">
        {metricLabels?.totalInactive ?? "Inactive Voters"}
      </div>
    ),
    cell: ({ row }: { row: Row<ActiveVotersData> }) => (
      <div className="text-sm text-right text-black">
        {(row.getValue("totalInactive") as number).toLocaleString()}
      </div>
    ),
  },
];
