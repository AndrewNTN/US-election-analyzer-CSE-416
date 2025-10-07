import { CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";

export interface CensusBlockData {
  blockId: string;
  latitude: number;
  longitude: number;
  dominantParty: "Democratic" | "Republican";
  democraticVoters: number;
  republicanVoters: number;
}

interface BubbleChartLayerProps {
  data: CensusBlockData[];
  visible: boolean;
}

// Component to create custom pane for bubble chart
function BubbleChartPane() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane("bubbleChart")) {
      const bubbleChartPane = map.createPane("bubbleChart");
      bubbleChartPane.style.zIndex = "700"; // Higher than other layers
      bubbleChartPane.style.pointerEvents = "auto";
    }
  }, [map]);

  return null;
}

export default function BubbleChartLayer({
  data,
  visible,
}: BubbleChartLayerProps) {
  useEffect(() => {
    console.log("BubbleChartLayer - visible:", visible);
    console.log("BubbleChartLayer - data length:", data.length);
    console.log("BubbleChartLayer - sample data:", data.slice(0, 2));
  }, [visible, data]);

  if (!visible) {
    console.log("BubbleChartLayer not visible, returning null");
    return null;
  }

  if (!data || data.length === 0) {
    console.log("BubbleChartLayer has no data");
    return null;
  }

  console.log("BubbleChartLayer rendering", data.length, "bubbles");

  return (
    <>
      <BubbleChartPane />
      {data.map((block) => (
        <CircleMarker
          key={block.blockId}
          center={[block.latitude, block.longitude]}
          radius={6}
          pathOptions={{
            fillColor:
              block.dominantParty === "Democratic" ? "#3b82f6" : "#ef4444",
            color: block.dominantParty === "Democratic" ? "#1d4ed8" : "#dc2626",
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7,
          }}
          pane="bubbleChart"
        >
          <Popup>
            <div className="text-xs">
              <div className="font-semibold mb-1">Block {block.blockId}</div>
              <div className="space-y-1">
                <div className="text-blue-600">
                  Democratic: {block.democraticVoters.toLocaleString()}
                </div>
                <div className="text-red-600">
                  Republican: {block.republicanVoters.toLocaleString()}
                </div>
                <div className="font-medium">
                  Dominant: {block.dominantParty}
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
