import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import statesJSON from "../../../data/us-states.json";
import { useRouter } from "@tanstack/react-router";
import { DETAILED_STATES } from "@/constants/states.ts";
import { formatStateNameForUrl } from "@/lib/utils";

type StateProps = { name: string; density: number };

const states = statesJSON as FeatureCollection<Geometry, StateProps>;

interface OutlineLayerProps {
  data?: FeatureCollection<Geometry, StateProps>;
  onFeatureClick?: (feature: Feature<Geometry, StateProps>) => void;
  showPopup?: boolean;
  outlineColor?: string;
  outlineWeight?: number;
  hoverColor?: string;
  hoverWeight?: number;
}

export default function OutlineLayer({
  data = states,
  onFeatureClick,
  outlineColor = "#5d5656",
  outlineWeight = 0.5,
  hoverColor = "#666",
  hoverWeight = 3,
}: OutlineLayerProps) {
  const router = useRouter();

  const getFeatureStyle = (
    feature?: Feature<Geometry, StateProps>,
  ): PathOptions => {
    // Check if this state is in our detailed states
    const isDetailedState =
      feature?.properties?.name &&
      Object.keys(DETAILED_STATES).includes(
        formatStateNameForUrl(feature.properties.name),
      );

    return {
      fillColor: "transparent",
      fillOpacity: 0,
      weight: isDetailedState ? outlineWeight * 6.5 : outlineWeight,
      opacity: 1,
      color: isDetailedState ? "#5c5555" : outlineColor,
    };
  };

  const onEachFeature = (
    feature: Feature<Geometry, StateProps>,
    layer: Layer,
  ) => {
    if (feature.properties) {
      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          const targetLayer = e.target;
          targetLayer.setStyle({
            weight: hoverWeight,
            color: hoverColor,
          });
        },
        mouseout: (e: LeafletMouseEvent) => {
          const targetLayer = e.target;
          targetLayer.setStyle(getFeatureStyle(feature));
        },
        click: () => {
          if (feature.properties.name) {
            // Convert state name to URL-friendly format
            const stateName = formatStateNameForUrl(feature.properties.name);
            router.navigate({ to: `/state/${stateName}` });
          }

          if (onFeatureClick) {
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
