import type { ColumnDef, Row } from "@tanstack/react-table";
import type { MailBallotsRejectedData } from "@/lib/api/eavs-requests";
import { TableTooltip } from "@/components/table/table-tooltip";

type MetricKey = keyof Omit<MailBallotsRejectedData, "jurisdictionName">;

interface GroupedColumn {
  id: string;
  label: string;
  columns: Array<{ key: MetricKey; label: string }>;
}

const getGroupedColumns = (
  metricLabels: Record<string, string>,
): GroupedColumn[] => {
  return [
    {
      id: "signature",
      label: "Signature",
      columns: [
        {
          key: "missingVoterSignature",
          label: metricLabels.missingVoterSignature,
        },
        {
          key: "missingWitnessSignature",
          label: metricLabels.missingWitnessSignature,
        },
        {
          key: "nonMatchingVoterSignature",
          label: metricLabels.nonMatchingVoterSignature,
        },
      ],
    },
    {
      id: "envelope",
      label: "Envelope",
      columns: [
        { key: "unofficialEnvelope", label: metricLabels.unofficialEnvelope },
        {
          key: "ballotMissingFromEnvelope",
          label: metricLabels.ballotMissingFromEnvelope,
        },
        { key: "noSecrecyEnvelope", label: metricLabels.noSecrecyEnvelope },
        {
          key: "multipleBallotsInOneEnvelope",
          label: metricLabels.multipleBallotsInOneEnvelope,
        },
        { key: "envelopeNotSealed", label: metricLabels.envelopeNotSealed },
        { key: "noPostmark", label: metricLabels.noPostmark },
        {
          key: "noResidentAddressOnEnvelope",
          label: metricLabels.noResidentAddressOnEnvelope,
        },
      ],
    },
    {
      id: "timing",
      label: "Time",
      columns: [{ key: "late", label: metricLabels.late }],
    },
    {
      id: "voter-status",
      label: "Voter",
      columns: [
        { key: "voterDeceased", label: metricLabels.voterDeceased },
        { key: "voterAlreadyVoted", label: metricLabels.voterAlreadyVoted },
        {
          key: "missingDocumentation",
          label: metricLabels.missingDocumentation,
        },
        { key: "voterNotEligible", label: metricLabels.voterNotEligible },
        { key: "noBallotApplication", label: metricLabels.noBallotApplication },
      ],
    },
  ];
};

export const getMailBallotsRejectedColumns = (
  metricLabels: Record<string, string>,
): ColumnDef<MailBallotsRejectedData>[] => {
  const GROUPED_COLUMNS = getGroupedColumns(metricLabels);

  return [
    {
      accessorKey: "jurisdictionName",
      header: () => <div className="text-left text-sm font-medium">Region</div>,
      cell: ({ row }: { row: Row<MailBallotsRejectedData> }) => {
        const regionName = row.getValue("jurisdictionName") as string;

        return (
          <TableTooltip content={regionName}>
            <div className="text-left text-xs text-black font-medium max-w-[125px] truncate cursor-help">
              {regionName}
            </div>
          </TableTooltip>
        );
      },
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
};
