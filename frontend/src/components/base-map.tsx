import React, { type ReactNode, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
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
    weight: 0.5,
    opacity: 0.8,
    color: "#9d9595",
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

const CustomPanes = () => {
  const map = useMap();

  useEffect(() => {
    // Create a custom pane for labels so they appear above other layers
    if (!map.getPane("labels")) {
      const labelsPane = map.createPane("labels");
      labelsPane.style.zIndex = "650";
      labelsPane.style.pointerEvents = "none"; // Prevent labels from blocking mouse events
    }

    // Create a custom pane for the base tiles with lower z-index
    if (!map.getPane("baseTiles")) {
      const baseTilesPane = map.createPane("baseTiles");
      baseTilesPane.style.zIndex = "100"; // Lower than overlays (200)
    }

    map.zoomControl.setPosition("bottomright");

    // Add custom styling to prevent zoom controls from being cut off using relative positioning
    const zoomControl = map.zoomControl.getContainer();
    if (zoomControl) {
      zoomControl.style.position = "relative";
      zoomControl.style.bottom = "20px";
      zoomControl.style.left = "20px";
      zoomControl.style.transform = "translate(-50%, -100%)";
    }

    // Also add padding to the map container to ensure controls don't get cut off
    const mapContainer = map.getContainer();
    if (mapContainer) {
      mapContainer.style.paddingBottom = "50px";
      mapContainer.style.paddingLeft = "50px";
    }
  }, [map]);

  return null;
};

interface BaseMapProps extends Omit<MapContainerProps, "center" | "zoom"> {
  center?: LatLngExpression;
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  children?: ReactNode;
}

export default function BaseMap({
  center = [38, -97.9], // Center of US
  zoom = 5,
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
      minZoom={4}
      style={style}
      className={className}
      scrollWheelZoom={true}
      {...mapProps}
    >
      <CustomPanes />

      {/* Base layer without labels */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
        attribution="©OpenStreetMap, ©CartoDB"
        maxZoom={18}
        pane="baseTiles"
      />

      <GeoJSON
        data={states}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />

      {/* Labels layer on top */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
        attribution="©OpenStreetMap, ©CartoDB"
        maxZoom={18}
        pane="labels"
      />

      {children}
    </MapContainer>
  );
}
