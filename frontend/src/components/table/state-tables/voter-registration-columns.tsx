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
    header: "Region",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("eavsRegion")}</div>
    ),
  },
  {
    accessorKey: "totalRegisteredVoters",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = Number(row.getValue("totalRegisteredVoters"));
      return (
        <div className="text-right text-sm">{amount.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "democraticVoters",
    header: () => <div className="text-right">Dem</div>,
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
    header: () => <div className="text-right">Rep</div>,
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
  },
  {
    accessorKey: "otherPartyVoters",
    header: () => <div className="text-right">Other</div>,
    cell: ({ row }) => {
      const amount = row.getValue("otherPartyVoters");
      return (
        <div className="text-right text-sm">
          <div>{Number(amount).toLocaleString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "registrationRate",
    header: () => <div className="text-right">Rate</div>,
    cell: ({ row }) => {
      const rate = Number(row.getValue("registrationRate"));
      return <div className="text-right text-sm">{rate}%</div>;
    },
  },
  {
    accessorKey: "activeVoters",
    header: () => <div className="text-right">Active</div>,
    cell: ({ row }) => {
      const amount = row.getValue("activeVoters");
      return (
        <div className="text-right text-sm">
          {Number(amount).toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "inactiveVoters",
    header: () => <div className="text-right">Inactive</div>,
    cell: ({ row }) => {
      const amount = row.getValue("inactiveVoters");
      return (
        <div className="text-right text-sm">
          {Number(amount).toLocaleString()}
        </div>
      );
    },
  },
];
