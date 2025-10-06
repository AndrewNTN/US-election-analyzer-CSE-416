import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  EquipmentCardsBase,
  type EquipmentSummary,
} from "@/components/equipment/equipment-cards-base.tsx";
import { getCertificationBadge } from "@/components/equipment/equipment-helpers.tsx";

interface EquipmentSummaryTableProps {
  data: EquipmentSummary[];
}

export function EquipmentSummaryCards({ data }: EquipmentSummaryTableProps) {
  const statsCards = [
    { label: "Total Devices", value: data.length },
    {
      label: "Total Quantity",
      value: data.reduce((sum, d) => sum + d.quantity, 0).toLocaleString(),
    },
    {
      label: "Avg Age",
      value: `${(data.reduce((sum, d) => sum + d.age, 0) / data.length || 0).toFixed(1)}y`,
    },
    {
      label: "Avg Reliability",
      value: `${(data.reduce((sum, d) => sum + d.reliability, 0) / data.length || 0).toFixed(1)}%`,
    },
  ];

  const renderCard = (item: EquipmentSummary, idx: number) => (
    <Card key={`${item.provider}-${item.model}-${idx}`}>
      <CardHeader className="pb-2 pt-2 px-3">
        <CardTitle className="text-sm flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-0.5">
              {item.provider}
            </div>
            <div className="font-semibold">{item.model}</div>
            <div className="text-xs font-normal text-muted-foreground mt-0.5">
              Quality: {item.qualityMeasure}
            </div>
          </div>
          <Badge variant="secondary" className="ml-2 text-xs shrink-0">
            Quantity: {item.quantity.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2 space-y-1.5">
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
          Quality: {item.qualityMeasure}
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

  return (
    <EquipmentCardsBase
      data={data}
      itemsPerPage={4}
      renderCard={renderCard}
      statsCards={statsCards}
    />
  );
}
