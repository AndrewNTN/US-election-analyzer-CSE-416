import { Badge } from "@/components/ui/badge";

export function getCertificationBadge(cert: string) {
  const variants: Record<string, { label: string }> = {
    "VVSG 2.0 Certified": {
      label: "VVSG 2.0 ✓",
    },
    "VVSG 2.0 Applied": {
      label: "VVSG 2.0 ⋯",
    },
    "VVSG 1.1 Certified": {
      label: "VVSG 1.1 ✓",
    },
    "VVSG 1.0 Certified": {
      label: "VVSG 1.0 ✓",
    },
    "Not Certified": {
      label: "None",
    },
  };
  const config = variants[cert] || variants["Not Certified"];
  return (
    <Badge variant="outline" className="text-xs">
      {config.label}
    </Badge>
  );
}

export function getReliabilityColor(reliability: number) {
  if (reliability >= 99) return "text-green-700";
  if (reliability >= 98) return "text-amber-700";
  return "text-orange-700";
}

export function getQualityBadge(quality: string) {
  const variants: Record<string, string> = {
    High: "bg-green-100 text-green-800 border-green-300",
    Medium: "bg-amber-100 text-amber-800 border-amber-300",
    Low: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <Badge
      variant="outline"
      className={`${variants[quality] || variants["Medium"]} text-xs`}
    >
      {quality}
    </Badge>
  );
}
