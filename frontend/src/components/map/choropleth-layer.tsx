import { GeoJSON } from "react-leaflet";
import type { FeatureCollection, Geometry, Feature } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import type { BaseMapProps, MapFeatureProps } from "@/lib/api/geojson-requests";
import {
  defaultGrayTint,
  getEquipmentAgeColor,
  getProvisionalBallotsColor,
  getActiveVotersColor,
  getPollbookDeletionsColor,
  getMailBallotsRejectedColor,
  getVoterRegistrationColor,
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
}

export default function ChoroplethLayer<
  T extends BaseMapProps = MapFeatureProps,
>({
  data,
  choroplethOption = STATE_CHOROPLETH_OPTIONS.OFF,
  stateView = false,
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

    if (feature?.properties) {
      const props = feature.properties as Record<string, unknown>;

      switch (choroplethOption) {
        // Splash page choropleth options
        case SPLASH_CHOROPLETH_OPTIONS.EQUIPMENT_AGE: {
          const equipmentAge =
            "EQUIPMENT_AGE" in props ? (props.EQUIPMENT_AGE as number) || 0 : 0;
          fillColor = getEquipmentAgeColor(equipmentAge);
          break;
        }

        // State page choropleth options
        case STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS: {
          const provisionalBallotsPct =
            "PROVISIONAL_BALLOTS_PCT" in props
              ? (props.PROVISIONAL_BALLOTS_PCT as number) || 0
              : 0;
          fillColor = getProvisionalBallotsColor(provisionalBallotsPct);
          break;
        }

        case STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS: {
          const activeVotersPct =
            "ACTIVE_VOTERS_PCT" in props
              ? (props.ACTIVE_VOTERS_PCT as number) || 0
              : 0;
          fillColor = getActiveVotersColor(activeVotersPct);
          break;
        }

        case STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS: {
          const pollbookDeletionsPct =
            "POLLBOOK_DELETIONS_PCT" in props
              ? (props.POLLBOOK_DELETIONS_PCT as number) || 0
              : 0;
          fillColor = getPollbookDeletionsColor(pollbookDeletionsPct);
          break;
        }

        case STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED: {
          const mailBallotsRejectedPct =
            "MAIL_BALLOTS_REJECTED_PCT" in props
              ? (props.MAIL_BALLOTS_REJECTED_PCT as number) || 0
              : 0;
          fillColor = getMailBallotsRejectedColor(mailBallotsRejectedPct);
          break;
        }

        case STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION: {
          const voterRegistrationPct =
            "VOTER_REGISTRATION_PCT" in props
              ? (props.VOTER_REGISTRATION_PCT as number) || 0
              : 0;
          fillColor = getVoterRegistrationColor(voterRegistrationPct);
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
