"use client";

import { DataTable } from "../data-table.tsx";
import {
  activeVotersColumns,
  type ActiveVotersData,
} from "./active-voters-columns.tsx";

interface ActiveVotersTableProps {
  data: ActiveVotersData[];
}

export function ActiveVotersTable({ data }: ActiveVotersTableProps) {
  return (
    <DataTable
      data={data}
      columns={activeVotersColumns}
      className="space-y-2"
    />
  );
}
