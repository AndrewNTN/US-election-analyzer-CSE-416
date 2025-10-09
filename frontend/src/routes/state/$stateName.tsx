import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import StateAnalysis from "@/pages/state-analysis.tsx";
import mockData from "../../../data/mockData.json";
import type { Voter } from "../../components/table/columns";

// Helper: convert mock JSON into proper Voter[]
function getData(stateName: string): Voter[] {
  const raw = (mockData as Record<string, any[]>)[stateName] || [];
  return raw.map((entry, i): Voter => ({
    id: String(entry.id ?? i),
    name: entry.name ?? "Unknown",
    email: entry.email ?? "",
    registered: String(entry.registered ?? "unknown"),
    mailInVote: Boolean(entry.mailInVote ?? false),
    zip: entry.zip ?? "UNK",
  }));
}

// Define the route (TanStack Router)
export const Route = createFileRoute("/state/$stateName")({
  component: State,
});

function State() {
  const { stateName } = Route.useParams();
  const [data, setData] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const abbr = stateName.slice(0, 2).toUpperCase(); // crude but works for now
        const url = `http://localhost:8080/api/eavs/states/${encodeURIComponent(
          abbr
        )}?electionYear=2024&includeJurisdictions=true`;


        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        // Prefer the jurisdictions array if present; otherwise, empty.
        const rows = Array.isArray(json?.jurisdictions)
          ? json.jurisdictions
          : Array.isArray(json)
          ? json
          : [];

        if (!rows.length) {
          throw new Error("No jurisdictions returned");
        }

        const mapped: Voter[] = rows.map((entry: any, i: number) => ({
          id: entry.fipsCode || String(i),
          name: entry.jurisdictionName || entry.stateFull || "Unknown",
          email: entry.email || "",
          registered:
            entry.totalRegistered != null
              ? String(entry.totalRegistered)
              : "unknown",
          mailInVote: Boolean(entry.totalMailBallots ?? false),
          zip: entry.zip || "UNK",
        }));

        setData(mapped);
      } catch (e: any) {
        console.error("Backend fetch failed:", e);
        setError(e.message || "Network error");
        setData(getData(stateName)); // fallback to mock
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [stateName]);

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading data for {stateName}…</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading {stateName} data: {error}
        <br />
        Showing mock data instead.
        <StateAnalysis stateName={stateName} mockData={data} />
      </div>
    );
  }

  return <StateAnalysis stateName={stateName} mockData={data} />;
}
