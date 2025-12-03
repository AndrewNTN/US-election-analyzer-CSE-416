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
import { createVotingEquipmentColumns } from "./voting-equipment-columns.tsx";
import type { VotingEquipment } from "@/lib/api/voting-requests";
import { VotingEquipmentBarChart } from "@/components/chart/voting-equipment-bar-chart.tsx";
import { useVotingEquipmentChartQuery } from "@/lib/api/use-queries.ts";

interface VotingEquipmentTableProps {
  data: VotingEquipment[];
  metricLabels?: Record<string, string>;
}

export function VotingEquipmentTable({
  data,
  metricLabels,
}: VotingEquipmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo(
    () => createVotingEquipmentColumns(metricLabels),
    [metricLabels],
  );

  const table = useReactTable({
    data,
    columns,
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

  const { data: chartData } = useVotingEquipmentChartQuery(
    selectedState?.stateFips,
  );

  const equipmentByYear = useMemo(() => {
    if (!chartData?.data) return [];

    return chartData.data.map((item) => ({
      year: item.year,
      dreNoVVPAT: item.dreNoVVPAT,
      dreWithVVPAT: item.dreWithVVPAT,
      ballotMarkingDevice: item.ballotMarkingDevice,
      scanner: item.scanner,
    }));
  }, [chartData]);

  return (
    <div className="flex flex-col space-y-1">
      <DataTableView
        table={table}
        className="flex flex-col space-y-1"
        tableContainerClassName="rounded-md border"
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
        cellClassName="py-1.5 px-2"
      />

      {selectedState && (
        <div className="flex-shrink-0 border-t pt-1 overflow-visible">
          {chartData === undefined ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading historical data...
            </div>
          ) : equipmentByYear.length > 0 ? (
            <VotingEquipmentBarChart
              stateName={selectedState.state}
              data={equipmentByYear}
              metricLabels={chartData?.metricLabels}
              xAxisLabel={chartData?.xAxisLabel}
              yAxisLabel={chartData?.yAxisLabel}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No historical data available for {selectedState.state}
            </div>
          )}
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
