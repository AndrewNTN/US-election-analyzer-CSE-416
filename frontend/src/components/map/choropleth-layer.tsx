import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import type { BaseMapProps, MapFeatureProps } from "@/types/map";
import {
  defaultGrayTint,
  getDensityColor,
  getPoliticalColor,
} from "@/lib/colors";
import {
  CHOROPLETH_OPTIONS,
  type ChoroplethOption,
} from "@/constants/choropleth";

interface ChoroplethLayerProps<T extends BaseMapProps = MapFeatureProps> {
  data: FeatureCollection<Geometry, T>;
  choroplethOption?: ChoroplethOption;
  stateView?: boolean;
}

export default function ChoroplethLayer<
  T extends BaseMapProps = MapFeatureProps,
>({
  data,
  choroplethOption = CHOROPLETH_OPTIONS.OFF,
  stateView = false,
}: ChoroplethLayerProps<T>) {
  const getFeatureStyle = (feature?: Feature<Geometry, T>): PathOptions => {
    if (choroplethOption === CHOROPLETH_OPTIONS.OFF) {
      return {
        fillColor: defaultGrayTint(),
        weight: 0,
        opacity: 0,
        color: "transparent",
        fillOpacity: 0.7,
      };
    }

    let fillColor = defaultGrayTint();

    if (feature?.properties) {
      const props = feature.properties as Record<string, unknown>;

      switch (choroplethOption) {
        case CHOROPLETH_OPTIONS.DENSITY: {
          const density =
            "DENSITY" in props ? (props.DENSITY as number) || 0 : 0;
          fillColor = getDensityColor(density);
          break;
        }

        case CHOROPLETH_OPTIONS.POLITICAL: {
          const republicanPct =
            "REPUBLICAN_PCT" in props
              ? (props.REPUBLICAN_PCT as number) || 0
              : 0;
          const democraticPct =
            "DEMOCRATIC_PCT" in props
              ? (props.DEMOCRATIC_PCT as number) || 0
              : 0;
          fillColor = getPoliticalColor(republicanPct, democraticPct);
          break;
        }
      }
    }

    return {
      fillColor,
      weight: 0,
      opacity: 0,
      color: "transparent",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, T>, layer: Layer) => {
    if (feature.properties && choroplethOption !== "off") {
      if (!stateView)
        layer.on({
          mouseover: (e: LeafletMouseEvent) => {
            const targetLayer = e.target;
            targetLayer.setStyle({
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

  return (
    <GeoJSON
      data={data}
      style={getFeatureStyle}
      onEachFeature={onEachFeature}
    />
  );
}
