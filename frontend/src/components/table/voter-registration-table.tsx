"use client";

import { DataTable } from "./data-table";
import {
  voterRegistrationColumns,
  type EAVSRegionVoterData,
} from "./voter-registration-columns";

interface VoterRegistrationTableProps {
  data: EAVSRegionVoterData[];
}

export function VoterRegistrationTable({ data }: VoterRegistrationTableProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs">
        <DataTable columns={voterRegistrationColumns} data={data} />
      </div>
    </div>
  );
}
