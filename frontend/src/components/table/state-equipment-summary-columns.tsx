import type { ColumnDef } from "@tanstack/react-table";

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
      header: "Make",
      size: 100,
      cell: ({ row }) => {
        const isDiscontinued = row.getValue("discontinued") as boolean;
        return (
          <div
            className={`text-xs font-medium ${isDiscontinued ? "text-red-600" : ""}`}
          >
            {row.getValue("make")}
          </div>
        );
      },
    },
    {
      accessorKey: "model",
      header: "Model",
      size: 120,
      cell: ({ row }) => {
        const isDiscontinued = row.getValue("discontinued") as boolean;
        return (
          <div className={`text-xs ${isDiscontinued ? "text-red-600" : ""}`}>
            {row.getValue("model")}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Qty</div>,
      size: 60,
      cell: ({ row }) => {
        const value = row.getValue("quantity") as number;
        return (
          <div className="text-right text-xs">{value.toLocaleString()}</div>
        );
      },
    },
    {
      accessorKey: "equipmentType",
      header: "Type",
      size: 100,
      cell: ({ row }) => (
        <div className="text-xs truncate" title={row.getValue("equipmentType")}>
          {row.getValue("equipmentType")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 180,
      cell: ({ row }) => (
        <div className="text-xs truncate" title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "age",
      header: () => <div className="text-right">Age</div>,
      size: 50,
      cell: ({ row }) => {
        const value = row.getValue("age") as number;
        return <div className="text-right text-xs">{value}y</div>;
      },
    },
    {
      accessorKey: "operatingSystem",
      header: "OS",
      size: 110,
      cell: ({ row }) => (
        <div
          className="text-xs truncate"
          title={row.getValue("operatingSystem")}
        >
          {row.getValue("operatingSystem")}
        </div>
      ),
    },
    {
      accessorKey: "certification",
      header: "Cert",
      size: 130,
      cell: ({ row }) => {
        const value = row.getValue("certification") as string;
        let colorClass = "";
        let shortValue = value;

        // Abbreviate certification names
        if (value === "VVSG 2.0 Certified") {
          colorClass = "text-green-700 font-medium";
          shortValue = "VVSG 2.0 ✓";
        } else if (value === "VVSG 2.0 Applied") {
          colorClass = "text-blue-700";
          shortValue = "VVSG 2.0 ⋯";
        } else if (value === "VVSG 1.1 Certified") {
          colorClass = "text-amber-700";
          shortValue = "VVSG 1.1 ✓";
        } else if (value === "VVSG 1.0 Certified") {
          colorClass = "text-orange-700";
          shortValue = "VVSG 1.0 ✓";
        } else if (value === "Not Certified") {
          colorClass = "text-gray-500";
          shortValue = "None";
        }

        return (
          <div className={`text-xs ${colorClass}`} title={value}>
            {shortValue}
          </div>
        );
      },
    },
    {
      accessorKey: "scanRate",
      header: () => <div className="text-center">Scan</div>,
      size: 60,
      cell: ({ row }) => {
        const value = row.getValue("scanRate") as number;
        return <div className="text-center text-xs">{value.toFixed(1)}%</div>;
      },
    },
    {
      accessorKey: "errorRate",
      header: () => <div className="text-center">Error</div>,
      size: 60,
      cell: ({ row }) => {
        const value = row.getValue("errorRate") as number;
        return <div className="text-center text-xs">{value.toFixed(2)}%</div>;
      },
    },
    {
      accessorKey: "reliability",
      header: () => <div className="text-center">Rel</div>,
      size: 60,
      cell: ({ row }) => {
        const value = row.getValue("reliability") as number;
        return <div className="text-center text-xs">{value.toFixed(1)}%</div>;
      },
    },
    {
      accessorKey: "discontinued",
      header: "",
      size: 0,
      cell: () => null,
    },
  ];
