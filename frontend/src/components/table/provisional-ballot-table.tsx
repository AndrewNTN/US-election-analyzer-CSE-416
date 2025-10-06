"use client";

import { DataTable } from "./data-table";
import {
  provisionalBallotsColumns,
  type ProvisionBallotsData,
} from "./provisional-ballot-columns";

interface ProvisionalBallotsTableProps {
  data: ProvisionBallotsData[];
}

export function ProvisionBallotsTable({ data }: ProvisionalBallotsTableProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs">
        <DataTable columns={provisionalBallotsColumns} data={data} />
      </div>
    </div>
  );
}
