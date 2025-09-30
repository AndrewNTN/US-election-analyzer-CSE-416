import { Link } from "@tanstack/react-router";
import BaseMap from "@/components/map/base-map.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft } from "lucide-react";
import stateCentersData from "../../data/state-centers.json";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";

interface StateAnalysisProps {
  stateName: string;
}

interface StateBounds {
  center: number[];
  zoom: number;
}

const stateCenters: Record<string, StateBounds> = stateCentersData as Record<
  string,
  StateBounds
>;

export default function StateAnalysis({ stateName }: StateAnalysisProps) {
  const getStateBounds = (state: string): StateBounds => {
    const stateKey = state.toLowerCase().replace(/\s+/g, "-");
    const stateData = stateCenters[stateKey];

    if (stateData) {
      return {
        center: [stateData.center[0], stateData.center[1]] as [number, number],
        zoom: stateData.zoom,
      };
    }

    return { center: [39, -97.9], zoom: 5 };
  };

  const formatStateName = (stateName: string): string => {
    if (
      stateName === stateName.toLowerCase() ||
      stateName === stateName.toUpperCase()
    ) {
      return stateName
        .split(/[\s_-]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    }

    return stateName
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  const stateBounds = getStateBounds(stateName);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Map */}
      <div className="w-1/2 relative overflow-hidden">
        {/* Back button overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="bg-white/90 backdrop-blur-sm"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Link>
          </Button>
        </div>

        {/* State map */}
        <div className="w-full h-screen">
          <BaseMap
            center={stateBounds.center as [number, number]}
            zoom={stateBounds.zoom}
            style={{ width: "100%", height: "100%", zIndex: 0 }}
          >
            <ChoroplethLayer />
          </BaseMap>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-1/2 bg-gray-50 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {formatStateName(stateName)}
          </h1>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Election Analysis
              </h2>
              <p className="text-gray-600 leading-relaxed">
                This is placeholder content for the election analysis of{" "}
                {stateName}. Here you would display detailed voting data,
                demographic information, and various analytical insights about
                this state's election patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
