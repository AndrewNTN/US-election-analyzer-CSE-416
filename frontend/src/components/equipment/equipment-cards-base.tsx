import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Base equipment interface with common fields
export interface BaseEquipment {
  quantity: number;
  age: number;
  operatingSystem: string;
  certification: string;
  scanRate: number;
  errorRate: number;
  reliability: number;
}

// Equipment Summary type (used for general equipment analysis)
export interface EquipmentSummary extends BaseEquipment {
  provider: string;
  model: string;
  qualityMeasure: string;
}

interface StatCard {
  label: string;
  value: string | number;
  className?: string;
}

interface EquipmentCardsBaseProps<T extends BaseEquipment> {
  data: T[];
  itemsPerPage: number;
  renderCard: (item: T, idx: number) => ReactNode;
  statsCards: StatCard[];
  footer?: ReactNode;
}

export function EquipmentCardsBase<T extends BaseEquipment>({
  data,
  itemsPerPage,
  renderCard,
  statsCards,
  footer,
}: EquipmentCardsBaseProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Stats Summary */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-2">
        {statsCards.map((stat, idx) => (
          <Card key={idx} className="p-3">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.className || ""}`}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Equipment Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2">
        <div className="grid grid-cols-2 gap-2">
          {paginatedData.map((item, idx) => renderCard(item, idx))}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex-shrink-0 flex items-center justify-between px-2 py-1">
        <div className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages} | Showing {startIndex + 1}-
          {Math.min(endIndex, data.length)} of {data.length}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Optional Footer */}
      {footer}
    </div>
  );
}
