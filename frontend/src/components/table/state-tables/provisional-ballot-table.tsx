"use client";

import { useEffect, useState } from "react";

import { DataTable, DataTablePagination } from "../data-table.tsx";
import {
  provisionalBallotsColumns,
  type ProvisionBallotsData,
} from "./provisional-ballot-columns.tsx";

interface ProvisionalBallotsTableProps {
  fipsPrefix: string; // e.g. "30" for Montana
}

interface ProvisionalBallotsApiResponse {
  jurisdictionName: string;
  provisionalBallots?: {
    totalProvisionalBallotsCast?: number;
    provisionalBallotsFullyCounted?: number;
    provisionalBallotsPartiallyCounted?: number;
    provisionalBallotsRejected?: number;
    reasonNoRegistration?: number;
    reasonNameNotFound?: number;
    provisionalComments?: string;
  };
}

export function ProvisionBallotsTable({
  fipsPrefix,
}: ProvisionalBallotsTableProps) {
  const [data, setData] = useState<ProvisionBallotsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/eavs/provisional/state/${fipsPrefix}`,
        );
        const json: ProvisionalBallotsApiResponse[] = await res.json();

        const mapped = json.map((record) => {
          const p = record.provisionalBallots || {};
          return {
            region: record.jurisdictionName || "Unknown",
            metrics: {
              E2a: p.totalProvisionalBallotsCast ?? 0,
              E2b: p.provisionalBallotsFullyCounted ?? 0,
              E2c: p.provisionalBallotsPartiallyCounted ?? 0,
              E2d: p.provisionalBallotsRejected ?? 0,
              E2e: p.reasonNoRegistration ?? 0,
              E2f: p.reasonNameNotFound ?? 0,
              E2g: 0,
              E2h: 0,
              E2i: 0,
            },
          } satisfies ProvisionBallotsData;
        });

        setData(mapped);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch provisional ballot data", error);
        setError("Failed to load provisional ballot data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fipsPrefix]);

  if (loading) return <p className="text-xs text-muted-foreground">Loading…</p>;
  if (error)
    return <p className="text-xs text-destructive">{error}. Please retry.</p>;

  return (
    <div className="space-y-2">
      <DataTable
        data={data}
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
