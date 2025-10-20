import { useState } from "react";
import { AlertCircle, Info } from "lucide-react";
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
  stateEquipmentSummaryColumns,
  type StateEquipmentSummary,
} from "@/components/table/state-tables/state-equipment-summary-columns.tsx";

interface StateEquipmentSummaryTableProps {
  data: StateEquipmentSummary[];
}

export function StateEquipmentSummaryTable({
  data,
}: StateEquipmentSummaryTableProps) {
  // Initialize sorting with make first, then model
  const [sorting, setSorting] = useState<SortingState>([
    { id: "make", desc: false },
    { id: "model", desc: false },
  ]);

  const table = useReactTable({
    data,
    columns: stateEquipmentSummaryColumns,
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
        cellClassName="py-1 px-3 whitespace-nowrap"
        paginationSlot={(instance) => (
          <DataTablePagination
            table={instance}
            align="between"
            className="px-1 py-0.5"
          />
        )}
      />
      <div className="mt-3 space-y-1.5 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 p-2.5 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-red-600">
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <p>
            <span className="font-semibold text-red-600">Red text</span>{" "}
            indicates equipment that is no longer available from the
            manufacturer.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">
            <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <p>Hover over truncated descriptions to view the full details.</p>
        </div>
      </div>
    </div>
  );
}
