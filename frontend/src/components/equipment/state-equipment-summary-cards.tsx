import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EquipmentCardsBase, type BaseEquipment } from "./equipment-cards-base";
import { getCertificationBadge } from "./equipment-helpers";

export type StateEquipmentSummary = BaseEquipment & {
  make: string;
  model: string;
  equipmentType: string;
  description: string;
  discontinued: boolean;
};

interface StateEquipmentSummaryCardsProps {
  data: StateEquipmentSummary[];
}

export function StateEquipmentSummaryCards({
  data,
}: StateEquipmentSummaryCardsProps) {
  const statsCards = [
    { label: "Total Devices", value: data.length },
    {
      label: "Total Quantity",
      value: data.reduce((sum, d) => sum + d.quantity, 0).toLocaleString(),
    },
    {
      label: "Avg Age",
      value: `${(
        data.reduce((sum, d) => sum + d.age, 0) / data.length || 0
      ).toFixed(1)}y`,
    },
    {
      label: "Discontinued",
      value: data.filter((d) => d.discontinued).length,
      className: "text-red-600",
    },
  ];

  const renderCard = (item: StateEquipmentSummary, idx: number) => (
    <Card
      key={`${item.make}-${item.model}-${idx}`}
      className={`${item.discontinued ? "border-red-300 bg-red-50/30" : ""}`}
    >
      <CardHeader className="pb-2 pt-2 px-3">
        <CardTitle className="text-sm flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-0.5">
              {item.make}
            </div>
            <div
              className={`font-semibold ${
                item.discontinued ? "text-red-600" : ""
              }`}
            >
              {item.model}
            </div>
            <div className="text-xs font-normal text-muted-foreground mt-0.5">
              {item.equipmentType}
            </div>
          </div>
          <Badge variant="secondary" className="ml-2 text-xs shrink-0">
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
              className="font-medium truncate max-w-[120px]"
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
            <div className="text-muted-foreground text-[10px]">Scan Rate</div>
            <div className="font-semibold">{item.scanRate.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-[10px]">Error Rate</div>
            <div className="font-semibold">{item.errorRate.toFixed(2)}%</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-[10px]">Reliability</div>
            <div className="font-semibold">{item.reliability.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const footer = (
    <div className="flex-shrink-0 px-2 py-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-red-600 text-xs font-bold">!</span>
      </div>
      <div className="text-xs text-red-800">
        <span className="font-semibold">Red text/border</span> indicates devices
        no longer available from the manufacturer
      </div>
    </div>
  );

  return (
    <EquipmentCardsBase
      data={data}
      itemsPerPage={4}
      renderCard={renderCard}
      statsCards={statsCards}
      footer={footer}
    />
  );
}
