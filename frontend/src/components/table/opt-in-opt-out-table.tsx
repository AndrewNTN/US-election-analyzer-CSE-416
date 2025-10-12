import { useMemo } from "react";

import { DataTable, DataTablePagination } from "./data-table.tsx";
import {
  optInOptOutColumns,
  type OptInOptOutRow,
} from "./opt-in-opt-out-columns.tsx";

interface OptInOptOutTableProps {
  data: OptInOptOutRow[];
  optInState: string;
  optOutWithSameDayState: string;
  optOutWithoutSameDayState: string;
}

export function OptInOptOutTable({
  data,
  optInState,
  optOutWithSameDayState,
  optOutWithoutSameDayState,
}: OptInOptOutTableProps) {
  const columns = useMemo(
    () =>
      optInOptOutColumns.map((col, idx) => {
        if (idx === 1) {
          return { ...col, header: `${optInState} (Opt-in)` };
        }
        if (idx === 2) {
          return {
            ...col,
            header: `${optOutWithSameDayState} (Opt-out, Same-Day)`,
          };
        }
        if (idx === 3) {
          return { ...col, header: `${optOutWithoutSameDayState} (Opt-out)` };
        }
        return col;
      }),
    [optInState, optOutWithSameDayState, optOutWithoutSameDayState],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      className="flex flex-col h-full space-y-2"
      tableContainerClassName="flex-1 min-h-0 overflow-auto"
      bodyClassName="text-sm"
      stickyHeader
      paginationSlot={(tableInstance) => (
        <DataTablePagination
          table={tableInstance}
          align="between"
          className="py-2"
        />
      )}
    />
  );
}
