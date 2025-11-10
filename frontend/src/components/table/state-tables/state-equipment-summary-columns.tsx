import type { ColumnDef } from "@tanstack/react-table";
import { TableTooltip } from "@/components/table/table-tooltip";

export type StateEquipmentSummary = {
  make: string;
  model: string;
  quantity: number;
  equipmentType: string;
  description: string;
  age: number;
  operatingSystem: string;
  certification: string;
  scanRate: number;
  errorRate: number;
  reliability: number;
  discontinued: boolean;
};

export const stateEquipmentSummaryColumns: ColumnDef<StateEquipmentSummary>[] =
  [
    {
      accessorKey: "make",
      header: () => <div className="whitespace-nowrap">Make</div>,
      cell: ({ row }) => {
        const discontinued = row.original.discontinued;
        const make = row.getValue("make") as string;

        return (
          <TableTooltip content={make}>
            <div
              className={`font-medium text-xs max-w-[75px] truncate cursor-help ${discontinued ? "text-red-600" : ""}`}
            >
              {make}
            </div>
          </TableTooltip>
        );
      },
    },
    {
      accessorKey: "model",
      header: () => <div className="whitespace-nowrap">Model</div>,
      cell: ({ row }) => {
        const discontinued = row.original.discontinued;
        const model = row.getValue("model") as string;

        return (
          <TableTooltip content={model}>
            <div
              className={`font-medium text-xs max-w-[75px] truncate cursor-help ${discontinued ? "text-red-600" : ""}`}
            >
              {model}
            </div>
          </TableTooltip>
        );
      },
    },
    {
      accessorKey: "equipmentType",
      header: () => <div className="whitespace-nowrap">Type</div>,
      cell: ({ row }) => (
        <div className="text-xs">{row.getValue("equipmentType")}</div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => (
        <div className="text-right whitespace-nowrap">Quantity</div>
      ),
      cell: ({ row }) => {
        const value = row.getValue("quantity") as number;
        return (
          <div className="text-right text-xs">{value.toLocaleString()}</div>
        );
      },
    },
    {
      accessorKey: "age",
      header: () => (
        <div className="text-right whitespace-nowrap">Age (Yrs)</div>
      ),
      cell: ({ row }) => {
        const value = row.getValue("age") as number;
        return <div className="text-right text-xs">{value}</div>;
      },
    },
    {
      accessorKey: "operatingSystem",
      header: () => <div className="whitespace-nowrap">OS</div>,
      cell: ({ row }) => (
        <div className="text-xs">{row.getValue("operatingSystem")}</div>
      ),
    },
    {
      accessorKey: "certification",
      header: () => <div className="whitespace-nowrap">Certification</div>,
      cell: ({ row }) => (
        <div className="text-xs">{row.getValue("certification")}</div>
      ),
    },
    {
      accessorKey: "scanRate",
      header: () => (
        <div className="text-right whitespace-nowrap">Scan Rate</div>
      ),
      cell: ({ row }) => {
        const value = row.getValue("scanRate") as number;
        return <div className="text-right text-xs">{value.toFixed(1)}%</div>;
      },
    },
    {
      accessorKey: "errorRate",
      header: () => (
        <div className="text-right whitespace-nowrap">Error Rate</div>
      ),
      cell: ({ row }) => {
        const value = row.getValue("errorRate") as number;
        return <div className="text-right text-xs">{value.toFixed(2)}%</div>;
      },
    },
    {
      accessorKey: "reliability",
      header: () => (
        <div className="text-right whitespace-nowrap">Reliability</div>
      ),
      cell: ({ row }) => {
        const value = row.getValue("reliability") as number;
        return <div className="text-right text-xs">{value.toFixed(1)}%</div>;
      },
    },
    {
      accessorKey: "description",
      header: () => <div className="whitespace-nowrap">Description</div>,
      cell: ({ row }) => {
        const description = row.getValue("description") as string;

        return (
          <TableTooltip content={description}>
            <div className="max-w-[50px] text-xs text-muted-foreground cursor-help truncate">
              {description}
            </div>
          </TableTooltip>
        );
      },
    },
  ];
