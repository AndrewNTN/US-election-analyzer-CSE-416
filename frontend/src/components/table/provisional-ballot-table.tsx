"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import {
  provisionalBallotsColumns,
  type ProvisionBallotsData,
} from "./provisional-ballot-columns";

interface ProvisionalBallotsTableProps {
  fipsPrefix: string; // e.g. "30" for Montana
}

export function ProvisionBallotsTable({ fipsPrefix }: ProvisionalBallotsTableProps) {
  const [data, setData] = useState<ProvisionBallotsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:8080/api/eavs/provisional/state/${fipsPrefix}`);
        const json = await res.json();

        const mapped = json.map((record: any) => {
          const p = record.provisionalBallots || {};
          return {
            E2a: p.totalProvisionalBallotsCast ?? 0,
            E2b: p.provisionalBallotsFullyCounted ?? 0,
            E2c: p.provisionalBallotsPartiallyCounted ?? 0,
            E2d: p.provisionalBallotsRejected ?? 0,
            E2e: p.reasonNoRegistration ?? 0,
            E2f: p.reasonNameNotFound ?? 0,
            E2g: 0,
            E2h: 0,
            E2i: p.provisionalComments ?? "",
          };
        });

        setData(mapped);
      } catch (error) {
        console.error("❌ Failed to fetch provisional ballot data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fipsPrefix]);

  if (loading) return <p className="text-xs text-gray-500">Loading…</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">
        Provisional Ballots (All jurisdictions — FIPS prefix {fipsPrefix})
      </h2>
      <DataTable columns={provisionalBallotsColumns} data={data} />
    </div>
  );
}
