import React, { type ReactNode } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { MapContainerProps } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import statesJSON from "../../data/us-states.json";

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

// Style function for GeoJSON features
const getFeatureStyle = (
  feature?: Feature<Geometry, StateProps>,
): PathOptions => {
  const density = feature?.properties?.density || 0;

  return {
    fillColor: getColor(density),
    weight: 1,
    opacity: 1,
    color: "#fff",
    fillOpacity: 0.7,
  };
};

// Optional: Add interaction handlers
const onEachFeature = (
  feature: Feature<Geometry, StateProps>,
  layer: Layer,
) => {
  if (feature.properties) {
    layer.bindPopup(`
      <div>
        <h3>${feature.properties.name}</h3>
        <p>Density: ${feature.properties.density}</p>
      </div>
    `);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const targetLayer = e.target;
        targetLayer.setStyle({
          weight: 3,
          color: "#666",
          fillOpacity: 0.9,
        });
      },
      mouseout: (e: LeafletMouseEvent) => {
        const targetLayer = e.target;
        targetLayer.setStyle(getFeatureStyle(feature));
      },
    });
  }
};

interface BaseMapProps extends Omit<MapContainerProps, "center" | "zoom"> {
  center?: LatLngExpression;
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  children?: ReactNode;
}

export default function BaseMap({
  center = [39.8283, -98.5795], // Center of US
  zoom = 4,
  style = {
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  className = "",
  children,
  ...mapProps
}: BaseMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={style}
      className={className}
      scrollWheelZoom={true}
      {...mapProps}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={18}
      />
      <GeoJSON
        data={states}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />
      {children}
    </MapContainer>
  );
}
