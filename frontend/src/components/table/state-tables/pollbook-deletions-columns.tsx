import type { ColumnDef, Row } from "@tanstack/react-table";

export interface PollbookDeletionsData {
  eavsRegion: string;
  A12b: number;
  A12c: number;
  A12d: number;
  A12e: number;
  A12f: number;
  A12g: number;
  A12h: number;
  notes: string;
}

export const pollbookDeletionsColumns: ColumnDef<PollbookDeletionsData>[] = [
  {
    accessorKey: "eavsRegion",
    header: () => <div className="text-left">EAVS Region</div>,
    cell: ({ row }: { row: Row<PollbookDeletionsData> }) => (
      <div className="text-sm text-left text-black font-medium">
        {row.getValue("eavsRegion")}
      </div>
    ),
  },
  ...(["A12b", "A12c", "A12d", "A12e", "A12f", "A12g", "A12h"] as const).map(
    (key) => ({
      accessorKey: key,
      header: () => <div className="text-right">{key.toUpperCase()}</div>,
      cell: ({ row }: { row: Row<PollbookDeletionsData> }) => (
        <div className="text-sm text-right text-black">
          {(row.getValue(key) as number).toLocaleString()}
        </div>
      ),
    }),
  ),
  {
    accessorKey: "notes",
    header: () => <div className="text-left">Notes</div>,
    cell: ({ row }: { row: Row<PollbookDeletionsData> }) => (
      <div className="text-sm text-left text-black">
        {row.getValue("notes")}
      </div>
    ),
  },
];
