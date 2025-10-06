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
    header: "Quantity",
    cell: ({ row }) => {
      const value = row.getValue("quantity") as number;
      return <div>{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "age",
    header: "Age (Years)",
    cell: ({ row }) => {
      const value = row.getValue("age") as number;
      return <div>{value}</div>;
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
    header: "Scan Rate (%)",
    cell: ({ row }) => {
      const value = row.getValue("scanRate") as number;
      return <div>{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "errorRate",
    header: "Error Rate (%)",
    cell: ({ row }) => {
      const value = row.getValue("errorRate") as number;
      return <div>{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "reliability",
    header: "Reliability (%)",
    cell: ({ row }) => {
      const value = row.getValue("reliability") as number;
      return <div>{value.toFixed(1)}%</div>;
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
