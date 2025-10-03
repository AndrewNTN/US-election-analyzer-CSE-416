"use client"
 
import type { ColumnDef } from "@tanstack/react-table"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Voter = {
  id: string
  name: string
  registered: "true" | "false" | "unknown"
  email: string
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
]