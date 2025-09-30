import React, { type ReactNode, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { MapContainerProps } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

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
