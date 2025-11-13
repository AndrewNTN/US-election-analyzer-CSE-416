"use client";

import { useMemo } from "react";

import { DataTable, DataTablePagination } from "../data-table.tsx";
import { createProvisionalBallotsColumns } from "./provisional-ballot-columns.tsx";
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
        provisionalTableData: {
          jurisdictionName:
            record.provisionalTableData.jurisdictionName || "Unknown",
          totalProv: record.provisionalTableData.totalProv ?? 0,
          provCountFullyCounted:
            record.provisionalTableData.provCountFullyCounted ?? 0,
          provCountPartialCounted:
            record.provisionalTableData.provCountPartialCounted ?? 0,
          provRejected: record.provisionalTableData.provRejected ?? 0,
          provisionalOtherStatus:
            record.provisionalTableData.provisionalOtherStatus ?? 0,
        },
        metricLabels: record.metricLabels,
      } satisfies ProvisionalTableResponse;
    });

    // Calculate totals for each metric
    const totals = mappedData.reduce(
      (acc, item) => {
        acc.totalProv += item.provisionalTableData.totalProv ?? 0;
        acc.provCountFullyCounted +=
          item.provisionalTableData.provCountFullyCounted ?? 0;
        acc.provCountPartialCounted +=
          item.provisionalTableData.provCountPartialCounted ?? 0;
        acc.provRejected += item.provisionalTableData.provRejected ?? 0;
        acc.provisionalOtherStatus +=
          item.provisionalTableData.provisionalOtherStatus ?? 0;
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
      provisionalTableData: {
        jurisdictionName: "TOTAL",
        ...totals,
      },
    };

    return [...mappedData, totalRow];
  }, [data]);

  const columns = useMemo(
    () => createProvisionalBallotsColumns(data[0]?.metricLabels ?? {}),
    [data],
  );

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
        columns={columns}
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
