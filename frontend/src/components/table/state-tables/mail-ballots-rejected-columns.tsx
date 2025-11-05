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
      { key: "C9b", label: "Missing" },
      { key: "C9d", label: "Miss wit" },
      { key: "C9c", label: "Mismatch" },
    ],
  },
  {
    id: "envelope",
    label: "Envelope",
    columns: [
      { key: "C9f", label: "Unoff." },
      { key: "C9g", label: "Empty" },
      { key: "C9h", label: "No Sec" },
      { key: "C9i", label: "Mult." },
      { key: "C9j", label: "Unseal" },
      { key: "C9k", label: "No PM" },
      { key: "C9l", label: "No Addr" },
    ],
  },
  {
    id: "timing",
    label: "Time",
    columns: [{ key: "C9h", label: "Late" }],
  },
  {
    id: "voter-status",
    label: "Voter",
    columns: [
      { key: "C9i", label: "Dead" },
      { key: "C9n", label: "Voted" },
      { key: "C9o", label: "No Doc" },
      { key: "C9p", label: "Not Eligible" },
      { key: "C9q", label: "No Application" },
    ],
  },
];

export const mailBallotsRejectedColumns: ColumnDef<MailBallotsRejectedData>[] =
  [
    {
      accessorKey: "eavsRegion",
      header: () => <div className="text-left text-sm font-medium">Region</div>,
      cell: ({ row }: { row: Row<MailBallotsRejectedData> }) => (
        <div className="text-left text-xs text-black font-medium">
          {row.getValue("eavsRegion")}
        </div>
      ),
    },
    ...GROUPED_COLUMNS.map((group) => ({
      id: group.id,
      header: () => (
        <div className="text-center text-sm font-semibold text-black border-l-2 border-gray-400 py-1 pl-3">
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
