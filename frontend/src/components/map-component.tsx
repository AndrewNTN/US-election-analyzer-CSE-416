import React, { type ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { MapContainerProps } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

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
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
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
      {children}
    </MapContainer>
  );
}
