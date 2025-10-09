"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import {
  provisionalBallotsColumns,
  type ProvisionBallotsData,
} from "./provisional-ballot-columns";

interface ProvisionalBallotsTableProps {
  fipsCode: string;
}

export function ProvisionBallotsTable({ fipsCode }: ProvisionalBallotsTableProps) {
  const [data, setData] = useState<ProvisionBallotsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:8080/api/eavs/provisional/fips/${fipsCode}`);
        const json = await res.json();
        const p = json.provisionalBallots;

        const mapped: ProvisionBallotsData[] = [
          {
            E2a: p.totalProvisionalBallotsCast,
            E2b: p.provisionalBallotsFullyCounted,
            E2c: p.provisionalBallotsPartiallyCounted,
            E2d: p.provisionalBallotsRejected,
            E2e: p.reasonNoRegistration,
            E2f: p.reasonNameNotFound,
            E2g: 0,
            E2h: 0,
            E2i: p.provisionalComments,
          },
        ];

        setData(mapped);
      } catch (error) {
        console.error("❌ Failed to fetch provisional ballot data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fipsCode]);

  if (loading) return <p className="text-xs text-gray-500">Loading...</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">Provisional Ballots (FIPS {fipsCode})</h2>
      <DataTable columns={provisionalBallotsColumns} data={data} />
    </div>
  );
}
