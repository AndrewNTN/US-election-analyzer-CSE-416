import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import statesJSON from "../../../data/us-states.json";

// TODO: make the layer more generic to support different datasets

type StateProps = { name: string; density: number };

const states = statesJSON as FeatureCollection<Geometry, StateProps>;

// Color scale function
const getColor = (density: number): string => {
  const colors = [
    "#f7fbff",
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#08306b",
  ];

  // Define quantile breaks - you can adjust these based on your data
  const breaks = [0, 10, 20, 50, 100, 200, 500, 1000];

  for (let i = 0; i < breaks.length; i++) {
    if (density <= breaks[i]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
};

interface ChoroplethLayerProps {
  data?: FeatureCollection<Geometry, StateProps>;
  colorFunction?: (density: number) => string;
}

export default function ChoroplethLayer({
  data = states,
  colorFunction = getColor,
}: ChoroplethLayerProps) {
  const getFeatureStyle = (
    feature?: Feature<Geometry, StateProps>,
  ): PathOptions => {
    const density = feature?.properties?.density || 0;

    return {
      fillColor: colorFunction(density),
      weight: 0,
      opacity: 0,
      color: "transparent",
      fillOpacity: 0.7,
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
            fillOpacity: 0.8,
          });
        },
        mouseout: (e: LeafletMouseEvent) => {
          const targetLayer = e.target;
          targetLayer.setStyle(getFeatureStyle(feature));
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
