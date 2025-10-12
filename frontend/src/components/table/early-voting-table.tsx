import { useMemo } from "react";

import { DataTable, DataTablePagination } from "./data-table.tsx";
import {
  earlyVotingColumns,
  type EarlyVotingRow,
} from "./early-voting-columns.tsx";

interface EarlyVotingTableProps {
  data: EarlyVotingRow[];
  republicanState: string;
  democraticState: string;
}

export function EarlyVotingTable({
  data,
  republicanState,
  democraticState,
}: EarlyVotingTableProps) {
  const columns = useMemo(
    () =>
      earlyVotingColumns.map((col, idx) => {
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
