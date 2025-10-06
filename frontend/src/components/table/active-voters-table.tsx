"use client";

import { DataTable } from "./data-table";
import {
  activeVotersColumns,
  type ActiveVotersData,
} from "./active-voters-columns";

interface ActiveVotersTableProps {
  data: ActiveVotersData[];
}

export function ActiveVotersTable({ data }: ActiveVotersTableProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs">
        <DataTable columns={activeVotersColumns} data={data} />
      </div>
    </div>
  );
}
