import { useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  DataTablePagination,
  DataTableView,
} from "@/components/table/data-table.tsx";
import {
  equipmentSummaryColumns,
  type EquipmentSummary,
} from "@/components/table/equipment-summary-columns.tsx";
import equipmentSummaryJson from "../../../data/equipmentSummary.json" with { type: "json" };

export function EquipmentSummaryTable() {
  // Use the equipment summary data from JSON
  const data = equipmentSummaryJson as EquipmentSummary[];

  // Initialize sorting with provider first, then model
  const [sorting, setSorting] = useState<SortingState>([
    { id: "provider", desc: false },
    { id: "model", desc: false },
  ]);

  const table = useReactTable({
    data,
    columns: equipmentSummaryColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="flex flex-col space-y-2 min-w-fit">
      <div className="flex flex-col space-y-1">
        <h3 className="text-lg font-semibold">Voting Equipment Used in 2024</h3>
        <p className="text-sm text-muted-foreground">
          Equipment details by provider and model with quality metrics
        </p>
      </div>
      <DataTableView
        table={table}
        className="flex flex-col space-y-1"
        tableContainerClassName="!overflow-visible rounded-md border"
        tableClassName="w-auto"
        headerClassName="bg-background"
        bodyClassName="text-xs"
        rowClassName="h-8"
        cellClassName="py-1 px-3 whitespace-nowrap"
        paginationSlot={(instance) => (
          <DataTablePagination
            table={instance}
            align="between"
            className="px-1 py-0.5"
          />
        )}
      />
    </div>
  );
}
