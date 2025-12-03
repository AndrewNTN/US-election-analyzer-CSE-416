import React, { type ReactNode, useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { MapContainerProps } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FeatureCollection, Geometry } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: LatLngExpression = [38.5, -99.0];

// FitBoundsToGeoJSON component to automatically zoom to fit the GeoJSON data
function FitBoundsToGeoJSON<T = Record<string, unknown>>({
  geoJsonData,
}: {
  geoJsonData?: FeatureCollection<Geometry, T>;
}) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData && geoJsonData.features.length > 0) {
      const group = L.geoJSON(geoJsonData);
      const bounds = group.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [75, 75] });
      }
    }
  }, [map, geoJsonData]);

  return null;
}

const CustomPanes = () => {
  const map = useMap();

  useEffect(() => {
    // Create a custom pane for labels so they appear above other layers
    if (!map.getPane("labels")) {
      const labelsPane = map.createPane("labels");
      labelsPane.style.zIndex = "650";
      labelsPane.style.pointerEvents = "none";
    }

    if (!map.getPane("baseTiles")) {
      const baseTilesPane = map.createPane("baseTiles");
      baseTilesPane.style.zIndex = "100";
    }

    map.zoomControl.setPosition("bottomright");

    const zoomControl = map.zoomControl.getContainer();
    if (zoomControl) {
      zoomControl.style.position = "relative";
      zoomControl.style.bottom = "20px";
      zoomControl.style.left = "20px";
      zoomControl.style.transform = "translate(-50%, -100%)";
    }

    const mapContainer = map.getContainer();
    if (mapContainer) {
      mapContainer.style.paddingBottom = "50px";
      mapContainer.style.paddingLeft = "50px";
    }
  }, [map]);

  return null;
};

// Component to update map minZoom dynamically
function UpdateMinZoom({ minZoom }: { minZoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setMinZoom(minZoom);
  }, [map, minZoom]);

  return null;
}

interface BaseMapProps<T = Record<string, unknown>>
  extends Omit<MapContainerProps, "center" | "zoom"> {
  center?: LatLngExpression;
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  children?: ReactNode;
  fitToGeoJSON?: FeatureCollection<Geometry, T>;
}

export default function BaseMap<T = Record<string, unknown>>({
  center = DEFAULT_CENTER,
  zoom = 4,
  style = {
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  className = "",
  children,
  fitToGeoJSON,
  ...mapProps
}: BaseMapProps<T>) {
  const [minZoom, setMinZoom] = useState(4);

  useEffect(() => {
    const updateMinZoom = () => {
      const isSmallScreen = window.innerWidth <= 1366;
      setMinZoom(isSmallScreen ? 4 : 5);
    };

    updateMinZoom();
    window.addEventListener("resize", updateMinZoom);
    return () => window.removeEventListener("resize", updateMinZoom);
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomSnap={0.5}
      minZoom={minZoom}
      maxBounds={[
        [15, -140],
        [56, -54],
      ]}
      maxBoundsViscosity={0.95}
      style={style}
      className={className}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      {...mapProps}
    >
      <CustomPanes />
      <UpdateMinZoom minZoom={minZoom} />

      {/* Auto-fit bounds if GeoJSON data is provided */}
      {fitToGeoJSON && <FitBoundsToGeoJSON geoJsonData={fitToGeoJSON} />}

      {/* Base layer without labels */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
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
