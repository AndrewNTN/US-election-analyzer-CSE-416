import type { ColumnDef } from "@tanstack/react-table";
import type { FloridaVoter } from "@/lib/api/voting-requests.ts";

export const generateVoterColumns = (
  labels: string[] = [],
): ColumnDef<FloridaVoter>[] => {
  return labels.map((label) => {
    let accessorKey = label.toLowerCase();
    if (label === "Name") accessorKey = "name";
    if (label === "Party") accessorKey = "party";

    return {
      accessorKey,
      header: label,
    };
  });
};
