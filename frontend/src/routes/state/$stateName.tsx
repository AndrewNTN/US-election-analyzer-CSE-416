import { createFileRoute } from "@tanstack/react-router";
import StateAnalysis from "@/pages/state-analysis.tsx";

export const Route = createFileRoute("/state/$stateName")({
  params: {
    parse: (params) => ({
      stateName: params.stateName,
    }),
  },
  validateSearch: (search: Record<string, unknown>): { stateFips?: string } => {
    return {
      stateFips: (search.stateFips as string) || undefined,
    };
  },
  component: State,
});

function State() {
  const { stateName } = Route.useParams();
  const { stateFips } = Route.useSearch();

  return <StateAnalysis stateName={stateName} stateFips={stateFips} />;
}
