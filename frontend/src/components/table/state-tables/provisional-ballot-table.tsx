"use client";

import { useMemo } from "react";

import { DataTable, DataTablePagination } from "../data-table.tsx";
import {
  provisionalBallotsColumns,
  type ProvisionBallotsData,
} from "./provisional-ballot-columns.tsx";
import { useProvisionalStateQuery } from "@/hooks/use-eavs-queries";

interface ProvisionalBallotsTableProps {
  fipsPrefix: string | null;
}

export function ProvisionBallotsTable({
  fipsPrefix,
}: ProvisionalBallotsTableProps) {
  const { data, isPending, isError, error } =
    useProvisionalStateQuery(fipsPrefix);

  const tableData = useMemo<ProvisionBallotsData[]>(() => {
    if (!data) {
      return [];
    }

    return data.map((record) => {
      const provisional = record.provisionalBallots || {};
      return {
        region: record.jurisdictionName || "Unknown",
        metrics: {
          E1a: provisional.E1a ?? 0,
          E1b: provisional.E1b ?? 0,
          E1c: provisional.E1c ?? 0,
          E1d: provisional.E1d ?? 0,
          E1e: provisional.E1e ?? 0,
        },
      } satisfies ProvisionBallotsData;
    });
  }, [data]);

  if (isPending) {
    return <p className="text-xs text-muted-foreground">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="text-xs text-destructive">
        {error?.message || "Failed to load provisional ballot data"}. Please
        retry.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <DataTable
        data={tableData}
        columns={provisionalBallotsColumns}
        paginationSlot={(table) => (
          <DataTablePagination
            table={table}
            align="between"
            className="text-xs"
          />
        )}
      />
    </div>
  );
}
