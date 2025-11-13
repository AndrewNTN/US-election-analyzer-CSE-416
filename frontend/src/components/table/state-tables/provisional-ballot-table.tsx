"use client";

import { useMemo } from "react";

import { DataTable, DataTablePagination } from "../data-table.tsx";
import { provisionalBallotsColumns } from "./provisional-ballot-columns.tsx";
import type { ProvisionalTableResponse } from "@/lib/api/eavs-requests";

interface ProvisionalBallotsTableProps {
  data: ProvisionalTableResponse[];
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
  const tableData = useMemo<ProvisionalTableResponse[]>(() => {
    const mappedData = data.map((record) => {
      return {
        jurisdictionName: record.jurisdictionName || "Unknown",
        totalProv: record.totalProv ?? 0,
        provCountFullyCounted: record.provCountFullyCounted ?? 0,
        provCountPartialCounted: record.provCountPartialCounted ?? 0,
        provRejected: record.provRejected ?? 0,
        provisionalOtherStatus: record.provisionalOtherStatus ?? 0,
      } satisfies ProvisionalTableResponse;
    });

    // Calculate totals for each metric
    const totals = mappedData.reduce(
      (acc, item) => {
        acc.totalProv += item.totalProv ?? 0;
        acc.provCountFullyCounted += item.provCountFullyCounted ?? 0;
        acc.provCountPartialCounted += item.provCountPartialCounted ?? 0;
        acc.provRejected += item.provRejected ?? 0;
        acc.provisionalOtherStatus += item.provisionalOtherStatus ?? 0;
        return acc;
      },
      {
        totalProv: 0,
        provCountFullyCounted: 0,
        provCountPartialCounted: 0,
        provRejected: 0,
        provisionalOtherStatus: 0,
      },
    );

    // Add total row at the end
    const totalRow: ProvisionalTableResponse = {
      jurisdictionName: "TOTAL",
      ...totals,
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
