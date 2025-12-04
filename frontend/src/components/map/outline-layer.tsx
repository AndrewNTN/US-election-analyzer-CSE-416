import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import { useRouter } from "@tanstack/react-router";
import { DETAILED_STATES } from "@/constants/states.ts";
import { formatStateNameForUrl } from "@/lib/utils";
import type {
  BaseMapProps,
  MapFeatureProps,
  StateProps,
} from "@/lib/api/geojson-requests";

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
  hoverWeight = 6,
  stateView = false,
  enableCountyInteractions = true,
}: OutlineLayerProps<T>) {
  const router = useRouter();

  const getFeatureStyle = (feature?: Feature<Geometry, T>): PathOptions => {
    const isDetailedState =
      feature?.properties?.stateName &&
      Object.keys(DETAILED_STATES).includes(
        formatStateNameForUrl(feature.properties.stateName),
      );
    const isCounty = feature?.properties && "geoid" in feature.properties;
    return {
      fillColor: "transparent",
      fillOpacity: 0,
      weight:
        !isCounty && (isDetailedState || stateView)
          ? outlineWeight * 5
          : outlineWeight * 2,
      opacity: 1,
      color: isDetailedState && !isCounty ? "#101010" : outlineColor,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, T>, layer: Layer) => {
    if (feature.properties) {
      const isCounty = feature.properties && "geoid" in feature.properties;
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
          if (feature.properties.stateName && !stateView) {
            const stateName = formatStateNameForUrl(
              feature.properties.stateName,
            );
            const stateFips =
              "stateFips" in feature.properties
                ? (feature.properties as unknown as StateProps).stateFips
                : undefined;
            router.navigate({
              to: `/state/${stateName}`,
              search: { stateFips },
            });
          }
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
