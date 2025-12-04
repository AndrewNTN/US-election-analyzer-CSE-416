import { fetchJson } from "@/lib/api/api-client";
import type { FeatureCollection, Geometry } from "geojson";
export interface BaseMapProps {
  stateName: string;
}

export interface StateProps extends BaseMapProps {
  stateFips: string;
  equipmentAge?: number;
  dataQualityScore?: number;
}

export interface CountyProps extends BaseMapProps {
  geoid: string;
  countyName: string;
  provisionalBallotsPct?: number;
  activeVotersPct?: number;
  pollbookDeletionsPct?: number;
  mailBallotsRejectedPct?: number;
  voterRegistrationPct?: number;
}

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
