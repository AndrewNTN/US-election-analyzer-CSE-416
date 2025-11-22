"use client";

import { useMemo } from "react";
import { DataTable } from "../data-table.tsx";
import {
  getActiveVotersColumns,
  type ActiveVotersData,
} from "./active-voters-columns.tsx";

interface ActiveVotersTableProps {
  data: ActiveVotersData[];
  metricLabels?: Record<string, string>;
}

export function ActiveVotersTable({
  data,
  metricLabels,
}: ActiveVotersTableProps) {
  const columns = useMemo(
    () => getActiveVotersColumns(metricLabels),
    [metricLabels],
  );

  return <DataTable data={data} columns={columns} className="space-y-2" />;
}
