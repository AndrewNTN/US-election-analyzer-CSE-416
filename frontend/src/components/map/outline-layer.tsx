import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import { useRouter } from "@tanstack/react-router";
import { DETAILED_STATES } from "@/constants/states.ts";
import { formatStateNameForUrl } from "@/lib/utils";
import type { BaseMapProps, MapFeatureProps } from "@/types/map";

interface OutlineLayerProps<T extends BaseMapProps = MapFeatureProps> {
  data: FeatureCollection<Geometry, T>;
  onFeatureClick?: (feature: Feature<Geometry, T>) => void;
  showPopup?: boolean;
  outlineColor?: string;
  outlineWeight?: number;
  hoverColor?: string;
  hoverWeight?: number;
  stateView?: boolean;
  enableCountyInteractions?: boolean;
}

export default function OutlineLayer<T extends BaseMapProps = MapFeatureProps>({
  data,
  onFeatureClick,
  outlineColor = "#5d5656",
  outlineWeight = 1,
  hoverColor = "#1a1a1a",
  hoverWeight = 4,
  stateView = false,
  enableCountyInteractions = true,
}: OutlineLayerProps<T>) {
  const router = useRouter();

  const getFeatureStyle = (feature?: Feature<Geometry, T>): PathOptions => {
    // Check if this state is in our detailed states
    const isDetailedState =
      feature?.properties?.NAME &&
      Object.keys(DETAILED_STATES).includes(
        formatStateNameForUrl(feature.properties.NAME),
      );
    const isCounty = feature?.properties && "STATEFP" in feature.properties;
    return {
      fillColor: "transparent",
      fillOpacity: 0,
      weight:
        isDetailedState || (stateView && !isCounty)
          ? outlineWeight * 3
          : outlineWeight,
      opacity: 1,
      color: isDetailedState ? "#101010" : outlineColor,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, T>, layer: Layer) => {
    if (feature.properties) {
      const isCounty = feature.properties && "STATEFP" in feature.properties;
      const shouldEnableHover =
        !stateView || (isCounty && enableCountyInteractions);

      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          if (shouldEnableHover) {
            const targetLayer = e.target;
            targetLayer.setStyle({
              weight: hoverWeight,
              color: hoverColor,
            });
          }
        },
        mouseout: (e: LeafletMouseEvent) => {
          if (shouldEnableHover) {
            const targetLayer = e.target;
            targetLayer.setStyle(getFeatureStyle(feature));
          }
        },
        click: () => {
          // Only handle navigation for state features and when not in state view
          if (feature.properties.NAME && !stateView) {
            const stateName = formatStateNameForUrl(feature.properties.NAME);
            router.navigate({ to: `/state/${stateName}` });
          }

          // Only handle county clicks if interactions are enabled
          if (onFeatureClick && (!isCounty || enableCountyInteractions)) {
            onFeatureClick(feature);
          }
        },
      });
    }
  };

  return (
    <GeoJSON
      data={data}
      style={(feature) => getFeatureStyle(feature)}
      onEachFeature={onEachFeature}
    />
  );
}
