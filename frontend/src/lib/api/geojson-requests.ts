import { fetchJson } from "@/lib/api/api-client";
import type { FeatureCollection, Geometry } from "geojson";
// Common base for all map feature properties
export interface BaseMapProps {
  stateName: string;
}

export interface StateProps extends BaseMapProps {
  stateFips: string;
}

export interface CountyProps extends BaseMapProps {
  geoid: string;
  countyName: string;
}

// Overarching type representing any map feature properties we handle
export type MapFeatureProps = StateProps | CountyProps;

export const getStatesGeoJson = async (
  signal?: AbortSignal,
): Promise<FeatureCollection<Geometry, StateProps>> =>
  fetchJson("/geojson/states", { signal });

export const getCountiesGeoJson = async (
  fipsPrefix: string,
  signal?: AbortSignal,
): Promise<FeatureCollection<Geometry, CountyProps>> =>
  fetchJson(`/geojson/counties/state/${fipsPrefix}`, { signal });
