import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type StateEquipmentSummary = {
  make: string;
  model: string;
  quantity: number;
  equipmentType: string;
  description: string;
  age: number;
  operatingSystem: string;
  certification: string;
  scanRate: number;
  errorRate: number;
  reliability: number;
  discontinued: boolean;
};

interface StateEquipmentSummaryCardsProps {
  data: StateEquipmentSummary[];
}

export function StateEquipmentSummaryCards({
  data,
}: StateEquipmentSummaryCardsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Group by manufacturer
  const groupedData = useMemo(() => {
    const groups: Record<string, StateEquipmentSummary[]> = {};
    paginatedData.forEach((item) => {
      if (!groups[item.make]) {
        groups[item.make] = [];
      }
      groups[item.make].push(item);
    });
    return groups;
  }, [paginatedData]);

  const getCertificationBadge = (cert: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      "VVSG 2.0 Certified": {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "VVSG 2.0 ✓",
      },
      "VVSG 2.0 Applied": {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: "VVSG 2.0 ⋯",
      },
      "VVSG 1.1 Certified": {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        label: "VVSG 1.1 ✓",
      },
      "VVSG 1.0 Certified": {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        label: "VVSG 1.0 ✓",
      },
      "Not Certified": {
        color: "bg-gray-100 text-gray-600 border-gray-300",
        label: "None",
      },
    };
    const config = variants[cert] || variants["Not Certified"];
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 99) return "text-green-700";
    if (reliability >= 98) return "text-amber-700";
    return "text-orange-700";
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Stats Summary */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total Devices</div>
          <div className="text-2xl font-bold">{data.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total Quantity</div>
          <div className="text-2xl font-bold">
            {data.reduce((sum, d) => sum + d.quantity, 0).toLocaleString()}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Avg Age</div>
          <div className="text-2xl font-bold">
            {(
              data.reduce((sum, d) => sum + d.age, 0) / data.length || 0
            ).toFixed(1)}
            y
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Discontinued</div>
          <div className="text-2xl font-bold text-red-600">
            {data.filter((d) => d.discontinued).length}
          </div>
        </Card>
      </div>

      {/* Equipment Cards - Grouped by Manufacturer */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2">
        {Object.entries(groupedData).map(([manufacturer, items]) => (
          <div key={manufacturer} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 py-1 z-10">
              {manufacturer} ({items.length})
            </h3>
            <div
              className={`grid gap-2 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {items.map((item, idx) => (
                <Card
                  key={`${item.make}-${item.model}-${idx}`}
                  className={`${item.discontinued ? "border-red-300 bg-red-50/30" : ""}`}
                >
                  <CardHeader className="pb-2 pt-2 px-3">
                    <CardTitle className="text-sm flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className={`font-semibold ${item.discontinued ? "text-red-600" : ""}`}
                        >
                          {item.model}
                        </div>
                        <div className="text-xs font-normal text-muted-foreground mt-0.5">
                          {item.equipmentType}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="ml-2 text-xs shrink-0"
                      >
                        Quantity: {item.quantity.toLocaleString()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-2 space-y-1.5">
                    <p
                      className="text-xs text-gray-600 line-clamp-2"
                      title={item.description}
                    >
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">OS:</span>{" "}
                        <span
                          className="font-medium"
                          title={item.operatingSystem}
                        >
                          {item.operatingSystem}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-muted-foreground">Age:</span>{" "}
                        <span className="font-medium">{item.age}y</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {getCertificationBadge(item.certification)}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t text-xs">
                      <div className="text-center">
                        <div className="text-muted-foreground text-[10px]">
                          Scan Rate
                        </div>
                        <div className="font-semibold">
                          {item.scanRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground text-[10px]">
                          Error Rate
                        </div>
                        <div className="font-semibold">
                          {item.errorRate.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground text-[10px]">
                          Reliability
                        </div>
                        <div
                          className={`font-semibold ${getReliabilityColor(item.reliability)}`}
                        >
                          {item.reliability.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
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

      {/* Legend */}
      <div className="flex-shrink-0 px-2 py-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-xs font-bold">!</span>
        </div>
        <div className="text-xs text-red-800">
          <span className="font-semibold">Red text/border</span> indicates
          devices no longer available from the manufacturer
        </div>
      </div>
    </div>
  );
}
