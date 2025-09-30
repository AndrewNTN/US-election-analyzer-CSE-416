import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import statesJSON from "../../../data/us-states.json";
import { useRouter } from "@tanstack/react-router";

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
  outlineColor = "#9d9595",
  outlineWeight = 0.5,
  hoverColor = "#666",
  hoverWeight = 3,
}: OutlineLayerProps) {
  const router = useRouter();

  const getFeatureStyle = (): PathOptions => {
    return {
      fillColor: "transparent",
      fillOpacity: 0,
      weight: outlineWeight,
      opacity: 0.8,
      color: outlineColor,
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
          targetLayer.setStyle(getFeatureStyle());
        },
        click: () => {
          if (feature.properties.name) {
            // Convert state name to URL-friendly format
            const stateName = feature.properties.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");
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
      style={getFeatureStyle}
      onEachFeature={onEachFeature}
    />
  );
}
