"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type EAVSRegionVoterData = {
  eavsRegion: string;
  totalRegisteredVoters: number;
  democraticVoters: number;
  republicanVoters: number;
  unaffiliatedVoters: number;
  otherPartyVoters: number;
  registrationRate: number;
  activeVoters: number;
  inactiveVoters: number;
};

export const voterRegistrationColumns: ColumnDef<EAVSRegionVoterData>[] = [
  {
    accessorKey: "eavsRegion",
    header: "County",
    cell: ({ row }) => (
      <div className="font-medium text-xs">{row.getValue("eavsRegion")}</div>
    ),
  },
  {
    accessorKey: "totalRegisteredVoters",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalRegisteredVoters"));
      return (
        <div className="text-right font-medium text-xs">
          {amount.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "democraticVoters",
    header: () => <div className="text-right">Dem</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("democraticVoters"));
      const total = parseFloat(row.getValue("totalRegisteredVoters"));
      const percentage = ((amount / total) * 100).toFixed(0);
      return (
        <div className="text-right text-xs">
          <div className="font-medium">{amount.toLocaleString()}</div>
          <div className="text-gray-500">({percentage}%)</div>
        </div>
      );
    },
  },
  {
    accessorKey: "republicanVoters",
    header: () => <div className="text-right">Rep</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("republicanVoters"));
      const total = parseFloat(row.getValue("totalRegisteredVoters"));
      const percentage = ((amount / total) * 100).toFixed(0);
      return (
        <div className="text-right text-xs">
          <div className="font-medium">{amount.toLocaleString()}</div>
          <div className="text-gray-500">({percentage}%)</div>
        </div>
      );
    },
  },
  {
    accessorKey: "unaffiliatedVoters",
    header: () => <div className="text-right">Unaffiliated</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("unaffiliatedVoters"));
      const total = parseFloat(row.getValue("totalRegisteredVoters"));
      const percentage = ((amount / total) * 100).toFixed(0);
      return (
        <div className="text-right text-xs">
          <div className="font-medium">{amount.toLocaleString()}</div>
          <div className="text-gray-500">({percentage}%)</div>
        </div>
      );
    },
  },
  {
    accessorKey: "registrationRate",
    header: () => <div className="text-right">Rate</div>,
    cell: ({ row }) => {
      const rate = parseFloat(row.getValue("registrationRate"));
      return <div className="text-right font-medium text-xs">{rate}%</div>;
    },
  },
];
