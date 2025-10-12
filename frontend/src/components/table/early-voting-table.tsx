import { useMemo } from "react";

import { DataTable, DataTablePagination } from "./data-table.tsx";
import {
  getEarlyVotingColumns,
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
    () => getEarlyVotingColumns(republicanState, democraticState),
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
          className="py-2"
        />
      )}
    />
  );
}
