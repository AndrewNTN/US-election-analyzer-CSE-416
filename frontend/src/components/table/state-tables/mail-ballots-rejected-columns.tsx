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
}

type MetricKey = keyof Omit<MailBallotsRejectedData, "eavsRegion">;

const GROUPED_COLUMNS: Array<{
  id: string;
  label: string;
  columns: Array<{ key: MetricKey; label: string }>;
}> = [
  {
    id: "signature",
    label: "Signature",
    columns: [
      { key: "C9b", label: "Miss." },
      { key: "C9c", label: "Mismatch" },
      { key: "C9d", label: "Miss. wit." },
      { key: "C9e", label: "Bad wit." },
      { key: "C9j", label: "Unsigned" },
    ],
  },
  {
    id: "envelope",
    label: "Envelope",
    columns: [
      { key: "C9f", label: "Unsealed" },
      { key: "C9g", label: "Empty" },
    ],
  },
  {
    id: "timing",
    label: "Timing",
    columns: [{ key: "C9h", label: "Late" }],
  },
  {
    id: "voter-status",
    label: "Voter Status",
    columns: [
      { key: "C9i", label: "Dead" },
      { key: "C9k", label: "No rec." },
      { key: "C9l", label: "Voted" },
      { key: "C9m", label: "Bad addr." },
      { key: "C9n", label: "Dupe" },
      { key: "C9q", label: "No ID" },
    ],
  },
  {
    id: "ballot-quality",
    label: "Quality",
    columns: [
      { key: "C9o", label: "Dmg." },
      { key: "C9p", label: "Other" },
    ],
  },
];

export const mailBallotsRejectedColumns: ColumnDef<MailBallotsRejectedData>[] =
  [
    {
      accessorKey: "eavsRegion",
      header: () => <div className="text-left text-xs font-medium">Region</div>,
      cell: ({ row }: { row: Row<MailBallotsRejectedData> }) => (
        <div className="text-left text-xs text-black font-medium">
          {row.getValue("eavsRegion")}
        </div>
      ),
    },
    ...GROUPED_COLUMNS.map((group) => ({
      id: group.id,
      header: () => (
        <div className="text-center text-xs font-semibold text-black border-l-2 border-gray-400 py-1 pl-3">
          {group.label}
        </div>
      ),
      columns: group.columns.map(({ key, label }, colIndex) => ({
        accessorKey: key,
        header: () => (
          <div
            className={`text-right text-xs text-black whitespace-nowrap py-0.5 ${colIndex === 0 ? "border-l-2 border-gray-400 pl-2" : ""}`}
          >
            {label}
          </div>
        ),
        cell: ({ row }: { row: Row<MailBallotsRejectedData> }) => (
          <div
            className={`text-right text-xs my-0.5 text-black ${colIndex === 0 ? "border-l-2 border-gray-400" : ""}`}
          >
            {(row.getValue(key) as number).toLocaleString()}
          </div>
        ),
      })),
    })),
  ];
