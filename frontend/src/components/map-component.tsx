import React, { type ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { MapContainerProps } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import Choropleth from 'react-leaflet-choropleth'
import type { FeatureCollection, Geometry } from "geojson";
import statesJSON from "../../data/us-states.json"

type StateProps = { name: string; density: number };

const states = statesJSON as FeatureCollection<Geometry, StateProps>;

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
      <Choropleth
        data={states}
        valueProperty={(f) => {
          const v = Number((f.properties as any)?.density);
          return Number.isFinite(v) ? v : NaN; // don't silently default to 0
        }}
        steps={7}
        mode="q" // quantiles spread colors even if distribution is skewed
        scale={["#f7fbff", "#08306b"]}
        style={{ color: "#fff", weight: 1, fillOpacity: 0.7 }} // border/opacity only; fill comes from the lib
      />
      {children}
    </MapContainer>
  );
}
