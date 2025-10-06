"use client";

import { DataTable } from "./data-table";
import {
  pollbookDeletionsColumns,
  type PollbookDeletionsData,
} from "./pollbook-deletions-columns";

interface PollbookDeletionsTableProps {
  data: PollbookDeletionsData[];
}

export function PollbookDeletionsTable({ data }: PollbookDeletionsTableProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs">
        <DataTable columns={pollbookDeletionsColumns} data={data} />
      </div>
    </div>
  );
}
