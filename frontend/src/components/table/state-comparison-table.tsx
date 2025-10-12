import { useMemo } from "react";

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
      stateComparisonColumns.map((col, idx) => {
        if (idx === 1) {
          return { ...col, header: `${republicanState} (R)` };
        }
        if (idx === 2) {
          return { ...col, header: `${democraticState} (D)` };
        }
        return col;
      }),
    [republicanState, democraticState],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={7}
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
