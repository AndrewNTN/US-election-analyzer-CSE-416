import { createFileRoute } from "@tanstack/react-router";
import StateAnalysis from "@/pages/state-analysis.tsx";
import mockData from "../../../data/mockData.json";

// Table imports
import type { Voter } from "../../components/table/columns";

// Type for raw mock data entries before normalization
type RawVoterEntry = {
  id?: string | number;
  name?: string;
  email?: string;
  registered?: boolean | string;
  mailInVote?: boolean | string;
  zip?: string;
};

export const Route = createFileRoute("/state/$stateName")({
  params: {
    parse: (params) => ({
      stateName: params.stateName,
    }),
  },
  component: State,
});

// Function to get mock data
function getData(stateName: string): Voter[] {
  // Convert raw JSON entries into typed Voter[] with safe defaults.
  const raw = (mockData as Record<string, RawVoterEntry[]>)[stateName] || [];

  return raw.map((entry): Voter => {
    const id = entry?.id ? String(entry.id) : "";
    const name = entry?.name ? String(entry.name) : "";
    const email = entry?.email ? String(entry.email) : "";

    // normalize "registered"
    let registered: Voter["registered"] = "unknown";
    if (entry?.registered === true || entry?.registered === "true") {
      registered = "true";
    } else if (entry?.registered === false || entry?.registered === "false") {
      registered = "false";
    }

    // normalize mailInVote to a boolean
    const mailInVote =
      entry?.mailInVote === true || entry?.mailInVote === "true";

    // normalize zip code (3 letters, fallback "UNK")
    const zip =
      typeof entry?.zip === "string" && entry.zip.length > 0
        ? entry.zip
        : "UNK";

    return { id, name, email, registered, mailInVote, zip };
  });
}

function State() {
  const { stateName } = Route.useParams();
  const data = getData(stateName);

  return <StateAnalysis stateName={stateName} mockData={data} />;
}
