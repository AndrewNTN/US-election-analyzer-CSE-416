"use client";

import { DataTable } from "../data-table.tsx";
import {
  voterRegistrationColumns,
  type EAVSRegionVoterData,
} from "./voter-registration-columns.tsx";

interface VoterRegistrationTableProps {
  data: EAVSRegionVoterData[];
}

export function VoterRegistrationTable({ data }: VoterRegistrationTableProps) {
  return (
    <DataTable
      data={data}
      columns={voterRegistrationColumns}
      className="space-y-2"
    />
  );
}
