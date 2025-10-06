import type { ColumnDef } from "@tanstack/react-table";

export type EquipmentSummary = {
  provider: string;
  model: string;
  quantity: number;
  age: number;
  operatingSystem: string;
  certification: string;
  scanRate: number;
  errorRate: number;
  reliability: number;
  qualityMeasure: string;
};

export const equipmentSummaryColumns: ColumnDef<EquipmentSummary>[] = [
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("provider")}</div>
    ),
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => <div>{row.getValue("model")}</div>,
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">Quantity</div>,
    cell: ({ row }) => {
      const value = row.getValue("quantity") as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "age",
    header: () => <div className="text-right">Age (Years)</div>,
    cell: ({ row }) => {
      const value = row.getValue("age") as number;
      return <div className="text-right">{value}</div>;
    },
  },
  {
    accessorKey: "operatingSystem",
    header: "Operating System",
    cell: ({ row }) => <div>{row.getValue("operatingSystem")}</div>,
  },
  {
    accessorKey: "certification",
    header: "Certification",
    cell: ({ row }) => <div>{row.getValue("certification")}</div>,
  },
  {
    accessorKey: "scanRate",
    header: () => <div className="text-center">Scan Rate (%)</div>,
    cell: ({ row }) => {
      const value = row.getValue("scanRate") as number;
      return <div className="text-center">{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "errorRate",
    header: () => <div className="text-center">Error Rate (%)</div>,
    cell: ({ row }) => {
      const value = row.getValue("errorRate") as number;
      return <div className="text-center">{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "reliability",
    header: () => <div className="text-center">Reliability (%)</div>,
    cell: ({ row }) => {
      const value = row.getValue("reliability") as number;
      return <div className="text-center">{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "qualityMeasure",
    header: "Quality",
    cell: ({ row }) => {
      const value = row.getValue("qualityMeasure") as string;
      return <div className="font-medium">{value}</div>;
    },
  },
];
