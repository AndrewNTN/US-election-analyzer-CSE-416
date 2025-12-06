import { GeoJSON, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer } from "leaflet";
import type { CountyEquipmentType } from "@/lib/api/voting-requests";
import {
  VOTING_EQUIPMENT_COLORS,
  type VotingEquipmentType,
} from "@/lib/choropleth";
import type { CountyProps } from "@/lib/api/geojson-requests";

interface EquipmentChoroplethLayerProps {
  geoJsonData: FeatureCollection<Geometry, CountyProps>;
  equipmentData: CountyEquipmentType[];
}

// Get which equipment types are present (non-zero) in a county
function getPresentEquipmentTypes(
  item: CountyEquipmentType,
): VotingEquipmentType[] {
  const present: VotingEquipmentType[] = [];
  if (item.dreNoVVPAT > 0) present.push("dre_no_vvpat");
  if (item.dreWithVVPAT > 0) present.push("dre_with_vvpat");
  if (item.ballotMarkingDevice > 0) present.push("ballot_marking_device");
  if (item.scanner > 0) present.push("scanner");
  return present;
}

// Generate a unique pattern ID for a combination of equipment types
function getPatternId(types: VotingEquipmentType[]): string {
  return `stripe-pattern-${types.sort().join("-")}`;
}

// Component to inject stripe pattern SVG definitions into the document
function StripePatternDefs({
  equipmentData,
}: {
  equipmentData: CountyEquipmentType[];
}) {
  const map = useMap();

  // Calculate all unique pattern combinations needed
  const patternCombinations = useMemo(() => {
    const combinations = new Map<string, VotingEquipmentType[]>();

    equipmentData.forEach((item) => {
      if (item.equipmentType === "mixed") {
        const presentTypes = getPresentEquipmentTypes(item);
        if (presentTypes.length > 1) {
          const patternId = getPatternId(presentTypes);
          if (!combinations.has(patternId)) {
            combinations.set(patternId, presentTypes);
          }
        }
      }
    });

    return combinations;
  }, [equipmentData]);

  useEffect(() => {
    // Create SVG container for patterns if it doesn't exist
    let patternSvg = document.getElementById(
      "equipment-pattern-svg",
    ) as SVGSVGElement | null;

    if (!patternSvg) {
      patternSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      patternSvg.setAttribute("width", "0");
      patternSvg.setAttribute("height", "0");
      patternSvg.style.position = "absolute";
      patternSvg.id = "equipment-pattern-svg";
      document.body.appendChild(patternSvg);
    }

    // Clear existing patterns
    patternSvg.innerHTML = "";

    // Create defs element
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.id = "equipment-patterns";

    // Create a pattern for each unique combination
    patternCombinations.forEach((types, patternId) => {
      const numTypes = types.length;
      const stripeWidth = 6; // Width of each stripe
      const patternWidth = stripeWidth * numTypes;

      const pattern = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "pattern",
      );
      pattern.setAttribute("id", patternId);
      pattern.setAttribute("patternUnits", "userSpaceOnUse");
      pattern.setAttribute("width", String(patternWidth));
      pattern.setAttribute("height", String(patternWidth));
      pattern.setAttribute("patternTransform", "rotate(45)");

      // Create stripes for each equipment type
      types.forEach((type, index) => {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("x", String(index * stripeWidth));
        rect.setAttribute("y", "0");
        rect.setAttribute("width", String(stripeWidth));
        rect.setAttribute("height", String(patternWidth));
        rect.setAttribute("fill", VOTING_EQUIPMENT_COLORS[type]);
        pattern.appendChild(rect);
      });

      defs.appendChild(pattern);
    });

    patternSvg.appendChild(defs);

    return () => {
      // Cleanup on unmount
      const svg = document.getElementById("equipment-pattern-svg");
      if (svg) {
        svg.remove();
      }
    };
  }, [map, patternCombinations]);

  return null;
}

export default function EquipmentChoroplethLayer({
  geoJsonData,
  equipmentData,
}: EquipmentChoroplethLayerProps) {
  // Create maps for quick lookup
  const equipmentMap = useMemo(() => {
    const map = new Map<string, CountyEquipmentType>();

    equipmentData.forEach((item) => {
      if (item.fipsCode) {
        map.set(item.fipsCode, item);
        // Also store 5-digit version for matching with county FIPS
        if (item.fipsCode.length >= 5) {
          map.set(item.fipsCode.substring(0, 5), item);
        }
      }
    });

    return map;
  }, [equipmentData]);

  const getEquipmentData = (
    feature?: Feature<Geometry, CountyProps>,
  ): CountyEquipmentType | null => {
    if (!feature?.properties?.geoid) return null;
    const geoid = feature.properties.geoid;
    return (
      equipmentMap.get(geoid) || equipmentMap.get(geoid.substring(0, 5)) || null
    );
  };

  const getFeatureStyle = (
    feature?: Feature<Geometry, CountyProps>,
  ): PathOptions => {
    const data = getEquipmentData(feature);

    let fillColor = "#e0e0e0"; // Default gray

    if (data) {
      if (data.equipmentType === "mixed") {
        // For mixed, use a pattern based on present equipment types
        const presentTypes = getPresentEquipmentTypes(data);
        if (presentTypes.length > 1) {
          fillColor = `url(#${getPatternId(presentTypes)})`;
        } else if (presentTypes.length === 1) {
          // If only one type is actually present, use its color
          fillColor = VOTING_EQUIPMENT_COLORS[presentTypes[0]];
        }
      } else {
        fillColor = VOTING_EQUIPMENT_COLORS[data.equipmentType] || "#e0e0e0";
      }
    }

    return {
      fillColor,
      weight: 0,
      opacity: 0,
      color: "transparent",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (
    feature: Feature<Geometry, CountyProps>,
    layer: Layer,
  ) => {
    const data = getEquipmentData(feature);

    // For mixed equipment, apply the pattern after the layer is created
    if (data?.equipmentType === "mixed") {
      const presentTypes = getPresentEquipmentTypes(data);
      if (presentTypes.length > 1) {
        setTimeout(() => {
          const pathElement = (layer as unknown as { _path?: SVGPathElement })
            ._path;
          if (pathElement) {
            pathElement.style.fill = `url(#${getPatternId(presentTypes)})`;
            pathElement.style.fillOpacity = "0.7";
          }
        }, 0);
      }
    }

    layer.on({
      mouseover: (e) => {
        const targetLayer = e.target;
        const pathElement = targetLayer._path as SVGPathElement | undefined;
        if (pathElement) {
          pathElement.style.fillOpacity = "0.9";
        }
      },
      mouseout: (e) => {
        const targetLayer = e.target;
        const pathElement = targetLayer._path as SVGPathElement | undefined;
        if (pathElement) {
          pathElement.style.fillOpacity = "0.7";
        }
      },
    });
  };

  return (
    <>
      <StripePatternDefs equipmentData={equipmentData} />
      <GeoJSON
        key={`equipment-${equipmentData.length}`}
        data={geoJsonData}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />
    </>
  );
}
