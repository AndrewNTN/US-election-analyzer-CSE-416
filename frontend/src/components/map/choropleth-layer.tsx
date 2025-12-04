import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import type { BaseMapProps, MapFeatureProps } from "@/lib/api/geojson-requests";
import {
  defaultGrayTint,
  getColorFromScale,
  type ColorScale,
} from "@/lib/choropleth";
import {
  SPLASH_CHOROPLETH_OPTIONS,
  STATE_CHOROPLETH_OPTIONS,
  type ChoroplethOption,
} from "@/lib/choropleth";

interface ChoroplethLayerProps<T extends BaseMapProps = MapFeatureProps> {
  data: FeatureCollection<Geometry, T>;
  choroplethOption?: ChoroplethOption;
  stateView?: boolean;
  colorScale?: ColorScale | null;
}

export default function ChoroplethLayer<
  T extends BaseMapProps = MapFeatureProps,
>({
  data,
  choroplethOption = STATE_CHOROPLETH_OPTIONS.OFF,
  stateView = false,
  colorScale,
}: ChoroplethLayerProps<T>) {
  const getFeatureStyle = (feature?: Feature<Geometry, T>): PathOptions => {
    if (choroplethOption === "off") {
      return {
        fillColor: defaultGrayTint(),
        weight: 0,
        opacity: 0,
        color: "transparent",
        fillOpacity: 0.7,
      };
    }

    let fillColor = defaultGrayTint();

    if (feature?.properties && colorScale) {
      const props = feature.properties as Record<string, unknown>;
      let val: number | undefined;

      switch (choroplethOption) {
        case SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE:
          val =
            "equipmentAge" in props
              ? (props.equipmentAge as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS:
          val =
            "provisionalBallotsPct" in props
              ? (props.provisionalBallotsPct as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS:
          val =
            "activeVotersPct" in props
              ? (props.activeVotersPct as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS:
          val =
            "pollbookDeletionsPct" in props
              ? (props.pollbookDeletionsPct as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED:
          val =
            "mailBallotsRejectedPct" in props
              ? (props.mailBallotsRejectedPct as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION:
          val =
            "voterRegistrationPct" in props
              ? (props.voterRegistrationPct as number)
              : undefined;
          break;
      }

      if (val !== undefined && val !== null) {
        fillColor = getColorFromScale(val, colorScale);
      }
    }

    return {
      fillColor,
      weight: 0,
      opacity: 0,
      color: "transparent",
      fillOpacity: 0.7,
      interactive: !stateView,
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
