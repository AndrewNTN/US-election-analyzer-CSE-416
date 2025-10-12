import { useMemo } from "react";

import { DataTable, DataTablePagination } from "./data-table.tsx";
import {
  getOptInOptOutColumns,
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
      getOptInOptOutColumns(
        optInState,
        optOutWithSameDayState,
        optOutWithoutSameDayState,
      ),
    [optInState, optOutWithSameDayState, optOutWithoutSameDayState],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={6}
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
