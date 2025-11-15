"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type EAVSRegionVoterData = {
  eavsRegion: string;
  totalRegisteredVoters: number;
  democraticVoters: number;
  republicanVoters: number;
  unaffiliatedVoters: number;
  otherPartyVoters: number;
  activeVoters: number;
  inactiveVoters: number;
};

export const voterRegistrationColumns: ColumnDef<EAVSRegionVoterData>[] = [
  {
    accessorKey: "eavsRegion",
    header: "Region",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("eavsRegion")}</div>
    ),
  },
  {
    accessorKey: "totalRegisteredVoters",
    header: () => <div className="text-right">Total Registered</div>,
    cell: ({ row }) => {
      const amount = Number(row.getValue("totalRegisteredVoters"));
      return (
        <div className="text-right text-sm">{amount.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "democraticVoters",
    header: () => <div className="text-right">Democratic</div>,
    cell: ({ row }) => {
      const amount = row.getValue("democraticVoters");
      return (
        <div className="text-right text-sm">
          <div>{Number(amount).toLocaleString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "republicanVoters",
    header: () => <div className="text-right">Republican</div>,
    cell: ({ row }) => {
      const amount = row.getValue("republicanVoters");
      return (
        <div className="text-right text-sm">
          <div>{Number(amount).toLocaleString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "unaffiliatedVoters",
    header: () => <div className="text-right">Unaffiliated</div>,
    cell: ({ row }) => {
      const amount = row.getValue("unaffiliatedVoters");
      return (
        <div className="text-right text-sm">
          <div>{Number(amount).toLocaleString()}</div>
        </div>
      );
    },
  }
];
