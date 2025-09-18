declare module "react-leaflet-choropleth" {
  import { Component } from "react";
  import type { Feature, FeatureCollection } from "geojson";
  import type { Layer, PathOptions } from "leaflet";
  export interface ChoroplethProps {
    data: FeatureCollection;
    valueProperty: string | ((f: Feature) => number);
    scale: string[] | [string, string];
    steps?: number;
    mode?: "e" | "q" | "k";
    style?: PathOptions | ((f: Feature) => PathOptions);
    onEachFeature?: (f: Feature, l: Layer) => void;
    filter?: (f: Feature) => boolean;
  }
  export default class Choropleth extends Component<ChoroplethProps> {}
}
