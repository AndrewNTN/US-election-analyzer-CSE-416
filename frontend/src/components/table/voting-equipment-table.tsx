import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
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
        pageSize: 3, // Reduced from 5 to 3
      },
    },
    enableRowSelection: true,
    enableMultiRowSelection: false, // Only allow selecting one state at a time
  });

  // Get selected state
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedState =
    selectedRows.length > 0 ? selectedRows[0].original : null;

  // Get equipment data by year for selected state
  const equipmentByYear =
    selectedState && selectedState.state in votingEquipmentByYearJson
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

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Table Section */}
      <div className="flex flex-col space-y-1 flex-shrink-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="py-1 px-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-7 cursor-pointer hover:bg-muted/50"
                    onClick={() => row.toggleSelected()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-1 px-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={votingEquipmentColumns.length}
                    className="h-12 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-1 py-0.5">
          <div className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()} | Total: {data.length} states
            {selectedState && (
              <span className="ml-2 font-semibold text-primary">
                | Selected: {selectedState.state}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Bar Charts Section - Only shown when a state is selected */}
      {selectedState && equipmentByYear.length > 0 && (
        <div className="flex-shrink-0 border-t pt-2">
          <VotingEquipmentBarChart
            stateName={selectedState.state}
            data={equipmentByYear}
          />
        </div>
      )}

      {/* Message when state has no data */}
      {selectedState && equipmentByYear.length === 0 && (
        <div className="flex items-center justify-center border-t pt-2 h-16">
          <p className="text-xs text-muted-foreground">
            No historical equipment data available for {selectedState.state}.
          </p>
        </div>
      )}

      {/* Instruction message when no state selected */}
      {!selectedState && (
        <div className="flex items-center justify-center h-16">
          <p className="text-xs text-muted-foreground">
            Click on a state to view equipment trends from 2016-2024
          </p>
        </div>
      )}
    </div>
  );
}
