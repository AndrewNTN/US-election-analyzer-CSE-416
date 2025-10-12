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
    E1a?: number; // Total Provisional Ballots Cast
    E1b?: number; // Provisional Ballots Fully Counted
    E1c?: number; // Provisional Ballots Partially Counted
    E1d?: number; // Provisional Ballots Rejected
    E1e?: number; // Provisional Ballots Other Status
    E1e_Other?: string; // Other Text
    E1Comments?: string; // Comments
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
              E1a: p.E1a ?? 0, // Total Provisional Ballots Cast
              E1b: p.E1b ?? 0, // Provisional Ballots Fully Counted
              E1c: p.E1c ?? 0, // Provisional Ballots Partially Counted
              E1d: p.E1d ?? 0, // Provisional Ballots Rejected
              E1e: p.E1e ?? 0, // Provisional Ballots Other Status
            },
            comments: p.E1Comments,
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
