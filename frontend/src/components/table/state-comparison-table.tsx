import { useMemo } from "react";

import { DataTable, DataTablePagination } from "./data-table.tsx";
import {
  getStateComparisonColumns,
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
    () => getStateComparisonColumns(republicanState, democraticState),
    [republicanState, democraticState],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={9}
      className="flex flex-col h-full space-y-2"
      tableContainerClassName="flex-1 min-h-0 overflow-auto"
      bodyClassName="text-sm"
      cellClassName="py-1.5 px-2"
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
