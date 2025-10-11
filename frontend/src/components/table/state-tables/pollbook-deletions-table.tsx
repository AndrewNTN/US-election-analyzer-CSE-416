"use client";

import { DataTable } from "../data-table.tsx";
import {
  pollbookDeletionsColumns,
  type PollbookDeletionsData,
} from "./pollbook-deletions-columns.tsx";

interface PollbookDeletionsTableProps {
  data: PollbookDeletionsData[];
}

export function PollbookDeletionsTable({ data }: PollbookDeletionsTableProps) {
  return (
    <DataTable
      data={data}
      columns={pollbookDeletionsColumns}
      className="space-y-2"
      bodyClassName="text-xs"
    />
  );
}
