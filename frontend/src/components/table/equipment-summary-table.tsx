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

interface EquipmentSummaryTableProps {
  data: EquipmentSummary[];
}

export function EquipmentSummaryTable({ data }: EquipmentSummaryTableProps) {
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
      <DataTableView
        table={table}
        className="flex flex-col space-y-1"
        tableContainerClassName="rounded-md border"
        tableClassName="w-auto"
        headerClassName="bg-background"
        bodyClassName="text-sm"
        rowClassName="h-8"
        cellClassName="py-1.5 px-3 whitespace-nowrap"
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
