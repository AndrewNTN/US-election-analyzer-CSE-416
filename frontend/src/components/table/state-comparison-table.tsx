import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, DataTablePagination } from "./data-table.tsx";
import {
  stateComparisonColumns,
  type StateComparisonRow,
} from "./state-comparison-columns.tsx";

interface StateComparisonTableProps {
  data: StateComparisonRow[];
  republicanState: string;
  democraticState: string;
}

export function StateComparisonTable({
  data,
  republicanState,
  democraticState,
}: StateComparisonTableProps) {
  const columns = useMemo(
    () =>
      stateComparisonColumns.map((col, idx): ColumnDef<StateComparisonRow> => {
        if (idx === 1) {
          return {
            ...col,
            header: () => (
              <div className="text-right">{republicanState} (R)</div>
            ),
          } as ColumnDef<StateComparisonRow>;
        }
        if (idx === 2) {
          return {
            ...col,
            header: () => (
              <div className="text-right">{democraticState} (D)</div>
            ),
          } as ColumnDef<StateComparisonRow>;
        }
        return col;
      }),
    [republicanState, democraticState],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={5}
      className="flex flex-col h-full space-y-2"
      tableContainerClassName="flex-1 min-h-0 overflow-auto"
      bodyClassName="text-sm"
      stickyHeader
      paginationSlot={(tableInstance) => (
        <DataTablePagination
          table={tableInstance}
          align="between"
          className="px-2 py-1"
        />
      )}
    />
  );
}
