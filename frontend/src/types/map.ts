// Common base for all map feature properties
export interface BaseMapProps {
  NAME: string;
}

export interface StateProps extends BaseMapProps {
  DENSITY: number;
  // Mock political data - would be replaced with real data
  REPUBLICAN_PCT?: number;
  DEMOCRATIC_PCT?: number;
}

export interface CountyProps extends BaseMapProps {
  STATEFP: string;
  // Mock political data - would be replaced with real data
  REPUBLICAN_PCT?: number;
  DEMOCRATIC_PCT?: number;
}

// Overarching type representing any map feature properties we handle
export type MapFeatureProps = StateProps | CountyProps;
