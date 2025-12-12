import type { ColumnDef } from "@tanstack/react-table";
import { TableTooltip } from "@/components/table/table-tooltip";

export type EquipmentSummary = {
  make: string;
  model: string;
  quantity: number | null;
  age: number | null;
  operatingSystem: string | null;
  certification: string | null;
  scanRate: string | null;
  errorRate: number | null;
  reliability: number | null;
  quality: number | null;
};

export const equipmentSummaryColumns: ColumnDef<EquipmentSummary>[] = [
  {
    accessorKey: "make",
    header: "Make",
    cell: ({ row }) => {
      const make = row.getValue("make") as string | null;
      return make ? (
        <TableTooltip content={make}>
          <div className="max-w-[80px] truncate cursor-help font-medium">
            {make}
          </div>
        </TableTooltip>
      ) : (
        <div className="font-medium">-</div>
      );
    },
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      const model = row.getValue("model") as string | null;
      return model ? (
        <TableTooltip content={model}>
          <div className="max-w-[120px] truncate cursor-help font-medium">
            {model}
          </div>
        </TableTooltip>
      ) : (
        <div className="font-medium">-</div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">Quantity</div>,
    cell: ({ row }) => {
      const value = row.getValue("quantity") as number | null;
      return <div className="text-right">{value?.toLocaleString() ?? "-"}</div>;
    },
  },
  {
    accessorKey: "age",
    header: () => <div className="text-right">Age (Years)</div>,
    cell: ({ row }) => {
      const value = row.getValue("age") as number | null;
      return <div className="text-right">{value ?? "-"}</div>;
    },
  },
  {
    accessorKey: "operatingSystem",
    header: "OS",
    cell: ({ row }) => {
      const os = row.getValue("operatingSystem") as string | null;
      return os ? (
        <TableTooltip content={os}>
          <div className="max-w-[100px] truncate cursor-help">{os}</div>
        </TableTooltip>
      ) : (
        <div>-</div>
      );
    },
  },
  {
    accessorKey: "certification",
    header: "Certification",
    cell: ({ row }) => <div>{row.getValue("certification") ?? "-"}</div>,
  },
  {
    accessorKey: "scanRate",
    header: () => <div className="text-right">Scan Rate</div>,
    cell: ({ row }) => {
      const value = row.getValue("scanRate") as string | null;
      return <div className="text-right">{value ?? "-"}</div>;
    },
  },
  {
    accessorKey: "errorRate",
    header: () => <div className="text-right">Error Rate</div>,
    cell: ({ row }) => {
      const value = row.getValue("errorRate") as number | null;
      return <div className="text-right">{value?.toFixed(1) ?? "-"}%</div>;
    },
  },
  {
    accessorKey: "reliability",
    header: () => <div className="text-right">Reliability</div>,
    cell: ({ row }) => {
      const value = row.getValue("reliability") as number | null;
      return <div className="text-right">{value?.toFixed(1) ?? "-"}%</div>;
    },
  },
  {
    accessorKey: "quality",
    header: () => <div className="text-right">Quality</div>,
    cell: ({ row }) => {
      const value = row.getValue("quality") as number | null;
      return <div className="text-right">{value?.toFixed(2) ?? "-"}</div>;
    },
  },
];
