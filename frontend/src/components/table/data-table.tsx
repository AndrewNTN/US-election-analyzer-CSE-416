"use client";

import type {
  Cell,
  ColumnDef,
  Row,
  Table as TanstackTable,
  TableOptions,
} from "@tanstack/react-table";
import type { HTMLAttributes, ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 7;

type Slot<TData> = ReactNode | ((table: TanstackTable<TData>) => ReactNode);

type SharedDataTableProps<TData> = {
  className?: string;
  tableContainerClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((rowIndex: number) => string);
  cellClassName?: string | ((cell: Cell<TData, unknown>) => string);
  emptyMessage?: ReactNode;
  showPagination?: boolean;
  stickyHeader?: boolean;
  toolbar?: Slot<TData>;
  children?: Slot<TData>;
  footer?: Slot<TData>;
  paginationSlot?: Slot<TData>;
  getRowProps?: (
    row: Row<TData>,
    index: number,
  ) => HTMLAttributes<HTMLTableRowElement>;
};

type ManagedDataTableProps<TData, TValue> = SharedDataTableProps<TData> & {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  pageSize?: number;
  tableOptions?: Partial<
    Omit<TableOptions<TData>, "data" | "columns" | "getCoreRowModel">
  >;
  table?: never;
};

type ControlledDataTableProps<TData> = SharedDataTableProps<TData> & {
  table: TanstackTable<TData>;
  data?: never;
  columns?: never;
  pageSize?: never;
  tableOptions?: never;
};

export type DataTableInstance<TData> = TanstackTable<TData>;

function renderSlot<TData>(
  slot: Slot<TData> | undefined,
  table: TanstackTable<TData>,
) {
  if (!slot) return null;
  return typeof slot === "function" ? slot(table) : slot;
}

type DataTableViewProps<TData> = SharedDataTableProps<TData> & {
  table: TanstackTable<TData>;
};

export function DataTableView<TData>({
  table,
  className,
  tableContainerClassName,
  tableClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
  cellClassName,
  emptyMessage = "No results.",
  showPagination = true,
  stickyHeader,
  toolbar,
  children,
  footer,
  paginationSlot,
  getRowProps,
}: DataTableViewProps<TData>) {
  const headerClasses = cn(
    stickyHeader && "sticky top-0 z-10 bg-background",
    headerClassName,
  );

  const resolveRowClassName = (index: number) =>
    typeof rowClassName === "function" ? rowClassName(index) : rowClassName;

  const resolveCellClassName = (cell: Cell<TData, unknown>) =>
    typeof cellClassName === "function" ? cellClassName(cell) : cellClassName;

  const paginationContent =
    paginationSlot ??
    ((instance: TanstackTable<TData>) => (
      <DataTablePagination table={instance} />
    ));

  return (
    <div className={cn("flex flex-col items-center space-y-1 pb-4", className)}>
      {renderSlot(toolbar, table)}

      <div
        className={cn(
          "overflow-x-auto rounded-md border w-fit",
          tableContainerClassName,
        )}
      >
        <Table className={tableClassName}>
          <TableHeader className={headerClasses}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={bodyClassName}>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row, index) => {
                  const extraRowProps = getRowProps?.(row, index) ?? {};
                  const { className: extraRowClassName, ...restRowProps } =
                    extraRowProps;

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        resolveRowClassName(index),
                        extraRowClassName,
                      )}
                      {...restRowProps}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={resolveCellClassName(cell)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {/* Add empty placeholder rows to maintain consistent height */}
                {Array.from({
                  length: Math.max(
                    0,
                    table.getState().pagination.pageSize -
                      table.getRowModel().rows.length,
                  ),
                }).map((_, index) => (
                  <TableRow
                    key={`empty-${index}`}
                    className={resolveRowClassName(
                      table.getRowModel().rows.length + index,
                    )}
                  >
                    {table.getAllLeafColumns().map((column) => (
                      <TableCell
                        key={column.id}
                        className={resolveCellClassName({
                          column,
                        } as Cell<TData, unknown>)}
                      >
                        &nbsp;
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Math.max(table.getAllLeafColumns().length, 1)}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {renderSlot(children, table)}

      {showPagination && renderSlot(paginationContent, table)}

      {renderSlot(footer, table)}
    </div>
  );
}

export type DataTableProps<TData, TValue> =
  | ManagedDataTableProps<TData, TValue>
  | ControlledDataTableProps<TData>;

function ManagedDataTable<TData, TValue>({
  data,
  columns,
  pageSize = DEFAULT_PAGE_SIZE,
  tableOptions,
  ...rest
}: ManagedDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
    ...tableOptions,
  });

  return <DataTableView table={table} {...rest} />;
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  if ("table" in props) {
    const { table, ...rest } = props as ControlledDataTableProps<TData>;
    return <DataTableView table={table} {...rest} />;
  }

  return (
    <ManagedDataTable {...(props as ManagedDataTableProps<TData, TValue>)} />
  );
}

type DataTablePaginationProps<TData> = {
  table: TanstackTable<TData>;
  label?: Slot<TData>;
  className?: string;
  align?: "end" | "between";
  pageSizeOptions?: number[];
};

export function DataTablePagination<TData>({
  table,
  label,
  className,
  align,
}: DataTablePaginationProps<TData>) {
  const defaultLabel = `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`;
  const labelContent = renderSlot(label, table) ?? defaultLabel;
  const justify = align ?? (labelContent ? "between" : "end");

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        justify === "between" ? "justify-between" : "justify-end",
        className,
      )}
    >
      {labelContent && (
        <div className="text-sm text-muted-foreground">{labelContent}</div>
      )}
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
  );
}
