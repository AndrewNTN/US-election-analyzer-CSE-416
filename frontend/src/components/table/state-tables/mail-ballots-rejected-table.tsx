"use client";

import { Info } from "lucide-react";
import { DataTable } from "../data-table.tsx";
import { getMailBallotsRejectedColumns } from "./mail-ballots-rejected-columns.tsx";
import type { MailBallotsRejectedData } from "@/lib/api/eavs-requests";

interface MailBallotsRejectedTableProps {
  data: MailBallotsRejectedData[];
  metricLabels: Record<string, string>;
}

export function MailBallotsRejectedTable({
  data,
  metricLabels,
}: MailBallotsRejectedTableProps) {
  const columns = getMailBallotsRejectedColumns(metricLabels);

  return (
    <div className="flex flex-col space-y-2">
      <DataTable data={data} columns={columns} className="space-y-2" />
      <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 p-2.5 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-primary">
            <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <p>Hover over truncated region names to view the full details.</p>
        </div>
      </div>
    </div>
  );
}
