import { Badge } from "@/components/ui/badge";

export function getCertificationBadge(cert: string) {
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
