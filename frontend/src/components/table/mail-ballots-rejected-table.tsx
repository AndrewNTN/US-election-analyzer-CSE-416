"use client";

import { DataTable } from "./data-table";
import {
  mailBallotsRejectedColumns,
  type MailBallotsRejectedData,
} from "./mail-ballots-rejected-columns";

interface MailBallotsRejectedTableProps {
  data: MailBallotsRejectedData[];
}

export function MailBallotsRejectedTable({
  data,
}: MailBallotsRejectedTableProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs">
        <DataTable columns={mailBallotsRejectedColumns} data={data} />
      </div>
    </div>
  );
}
