"use client";

import { useMemo } from "react";

import { DataTable, DataTablePagination } from "../data-table.tsx";
import {
  provisionalBallotsColumns,
  type ProvisionBallotsData,
} from "./provisional-ballot-columns.tsx";
import type { ProvisionalBallotsApiResponse } from "@/lib/api/eavs-requests";

interface ProvisionalBallotsTableProps {
  data: ProvisionalBallotsApiResponse[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export function ProvisionBallotsTable({
  data,
  isPending,
  isError,
  error,
}: ProvisionalBallotsTableProps) {
  const tableData = useMemo<ProvisionBallotsData[]>(() => {
    if (!data) {
      return [];
    }

    const mappedData = data.map((record) => {
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

    // Calculate totals for each metric
    const totals = mappedData.reduce(
      (acc, item) => {
        acc.E1a += item.metrics.E1a;
        acc.E1b += item.metrics.E1b;
        acc.E1c += item.metrics.E1c;
        acc.E1d += item.metrics.E1d;
        acc.E1e += item.metrics.E1e;
        return acc;
      },
      { E1a: 0, E1b: 0, E1c: 0, E1d: 0, E1e: 0 },
    );

    // Add total row at the end
    const totalRow: ProvisionBallotsData = {
      region: "TOTAL",
      metrics: totals,
    };

    return [...mappedData, totalRow];
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
