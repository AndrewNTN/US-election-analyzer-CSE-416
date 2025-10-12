import { useMemo, useState } from "react";

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination, DataTableView } from "./data-table.tsx";
import {
  votingEquipmentColumns,
  type VotingEquipment,
} from "./voting-equipment-columns.tsx";
import { VotingEquipmentBarChart } from "@/components/chart/voting-equipment-bar-chart.tsx";
import votingEquipmentByYearJson from "../../../data/votingEquipmentByYear.json" with { type: "json" };

interface VotingEquipmentTableProps {
  data: VotingEquipment[];
}

export function VotingEquipmentTable({ data }: VotingEquipmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns: votingEquipmentColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedState =
    selectedRows.length > 0 ? selectedRows[0].original : null;

  const equipmentByYear = useMemo(() => {
    if (!selectedState) return [];

    return selectedState.state in votingEquipmentByYearJson
      ? (
          votingEquipmentByYearJson as Record<
            string,
            Array<{
              year: number;
              dreNoVVPAT: number;
              dreWithVVPAT: number;
              ballotMarkingDevice: number;
              scanner: number;
            }>
          >
        )[selectedState.state]
      : [];
  }, [selectedState]);

  return (
    <div className="flex flex-col space-y-1">
      <DataTableView
        table={table}
        className="flex flex-col space-y-1"
        tableContainerClassName="rounded-md overflow-visible"
        headerClassName="bg-background"
        bodyClassName="text-sm"
        rowClassName="h-7 cursor-pointer hover:bg-muted/50"
        getRowProps={(row) => ({
          onClick: () => row.toggleSelected(),
          role: "button",
          tabIndex: 0,
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              row.toggleSelected();
            }
          },
        })}
        paginationSlot={(instance) => (
          <DataTablePagination
            table={instance}
            align="between"
            className="px-1 py-0.5"
          />
        )}
        cellClassName="py-1 px-2"
      />

      {selectedState && equipmentByYear.length > 0 && (
        <div className="flex-shrink-0 border-t pt-1 overflow-visible">
          <VotingEquipmentBarChart
            stateName={selectedState.state}
            data={equipmentByYear}
          />
        </div>
      )}

      {selectedState && equipmentByYear.length === 0 && (
        <div className="flex items-center justify-center border-t pt-2 h-16">
          <p className="text-sm text-muted-foreground font-medium">
            No historical equipment data available for {selectedState.state}.
          </p>
        </div>
      )}

      {!selectedState && (
        <div className="flex items-center justify-center h-16">
          <p className="text-sm text-muted-foreground font-medium">
            Click on a state to view equipment trends from 2016-2024
          </p>
        </div>
      )}
    </div>
  );
}
