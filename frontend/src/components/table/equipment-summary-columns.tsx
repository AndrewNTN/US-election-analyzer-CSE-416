import type { ColumnDef } from "@tanstack/react-table";

export type EquipmentSummary = {
  make: string;
  model: string;
  quantity: number;
  age: number;
  operatingSystem: string;
  certification: string;
  scanRate: number;
  errorRate: number;
  reliability: number;
  qualityMeasure: number;
};

export const equipmentSummaryColumns: ColumnDef<EquipmentSummary>[] = [
  {
    accessorKey: "make",
    header: "Make",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("make")}</div>
    ),
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("model")}</div>
    ),
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
    header: "OS",
    cell: ({ row }) => <div>{row.getValue("operatingSystem")}</div>,
  },
  {
    accessorKey: "certification",
    header: "Certification",
    cell: ({ row }) => <div>{row.getValue("certification")}</div>,
  },
  {
    accessorKey: "scanRate",
    header: () => <div className="text-right">Scan Rate</div>,
    cell: ({ row }) => {
      const value = row.getValue("scanRate") as number;
      return <div className="text-right">{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "errorRate",
    header: () => <div className="text-right">Error Rate</div>,
    cell: ({ row }) => {
      const value = row.getValue("errorRate") as number;
      return <div className="text-right">{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "reliability",
    header: () => <div className="text-right">Reliability</div>,
    cell: ({ row }) => {
      const value = row.getValue("reliability") as number;
      return <div className="text-right">{value.toFixed(1)}%</div>;
    },
  },
  {
    accessorKey: "qualityMeasure",
    header: () => <div className="text-right">Quality</div>,
    cell: ({ row }) => {
      const value = row.getValue("qualityMeasure") as number;
      return <div className="text-right">{value.toFixed(2)}</div>;
    },
  },
];
