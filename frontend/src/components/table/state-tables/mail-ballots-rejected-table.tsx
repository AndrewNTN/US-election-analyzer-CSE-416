"use client";

import { DataTable } from "../data-table.tsx";
import {
  mailBallotsRejectedColumns,
  type MailBallotsRejectedData,
} from "./mail-ballots-rejected-columns.tsx";

interface MailBallotsRejectedTableProps {
  data: MailBallotsRejectedData[];
}

export function MailBallotsRejectedTable({
  data,
}: MailBallotsRejectedTableProps) {
  return (
    <DataTable
      data={data}
      columns={mailBallotsRejectedColumns}
      className="space-y-2"
    />
  );
}
