import { createFileRoute } from "@tanstack/react-router";
import StateAnalysis from "@/components/state-analysis.tsx";

export const Route = createFileRoute("/state/$stateName")({
  params: {
    parse: (params) => ({
      stateName: params.stateName,
    }),
  },
  component: State,
});

function State() {
  const { stateName } = Route.useParams();

  return <StateAnalysis stateName={stateName} />;
}
