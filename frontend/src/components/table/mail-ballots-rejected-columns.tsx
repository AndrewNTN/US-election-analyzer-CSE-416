import type { ColumnDef, Row } from "@tanstack/react-table";

export interface MailBallotsRejectedData {
  eavsRegion: string;
  C9b: number;
  C9c: number;
  C9d: number;
  C9e: number;
  C9f: number;
  C9g: number;
  C9h: number;
  C9i: number;
  C9j: number;
  C9k: number;
  C9l: number;
  C9m: number;
  C9n: number;
  C9o: number;
  C9p: number;
  C9q: number;
  notes: string;
}

export const mailBallotsRejectedColumns: ColumnDef<MailBallotsRejectedData>[] =
  [
    {
      accessorKey: "eavsRegion",
      header: () => <div className="text-left">EAVS Region</div>,
      cell: ({ row }: { row: Row<MailBallotsRejectedData> }) => (
        <div className="text-xs text-left text-black font-medium">
          {row.getValue("eavsRegion")}
        </div>
      ),
    },
    ...(
      [
        "C9b",
        "C9c",
        "C9d",
        "C9e",
        "C9f",
        "C9g",
        "C9h",
        "C9i",
        "C9j",
        "C9k",
        "C9l",
        "C9m",
        "C9n",
        "C9o",
        "C9p",
        "C9q",
      ] as const
    ).map((key) => ({
      accessorKey: key,
      header: () => <div className="text-right">{key.toUpperCase()}</div>,
      cell: ({ row }: { row: Row<MailBallotsRejectedData> }) => (
        <div className="text-xs text-right text-black">
          {(row.getValue(key) as number).toLocaleString()}
        </div>
      ),
    })),
    {
      accessorKey: "notes",
      header: () => <div className="text-left">Notes</div>,
      cell: ({ row }: { row: Row<MailBallotsRejectedData> }) => (
        <div className="text-xs text-left text-black">
          {row.getValue("notes")}
        </div>
      ),
    },
  ];
