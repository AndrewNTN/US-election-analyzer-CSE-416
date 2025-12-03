import { fetchJson } from "@/lib/api/api-client";
import type { FeatureCollection, Geometry } from "geojson";
export interface BaseMapProps {
  stateName: string;
}

export interface StateProps extends BaseMapProps {
  stateFips: string;
  EQUIPMENT_AGE?: number;
  dataQualityScore?: number;
}

export interface CountyProps extends BaseMapProps {
  geoid: string;
  countyName: string;
  PROVISIONAL_BALLOTS_PCT?: number;
  ACTIVE_VOTERS_PCT?: number;
  POLLBOOK_DELETIONS_PCT?: number;
  MAIL_BALLOTS_REJECTED_PCT?: number;
  VOTER_REGISTRATION_PCT?: number;
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
