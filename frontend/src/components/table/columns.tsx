"use client"

import type { ColumnDef } from "@tanstack/react-table"

export type Voter = {
  id: string
  name: string
  registered: "true" | "false" | "unknown"
  email: string
  mailInVote: boolean
  zip: string
}

export const columns: ColumnDef<Voter>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "registered",
    header: "Registered",
  },
  {
    accessorKey: "mailInVote",
    header: "Mail-in Vote",
    cell: ({ row }) => (row.original.mailInVote ? "Yes" : "No"),
  },
  {
    accessorKey: "zip",
    header: "Zip Code",
  },
]
