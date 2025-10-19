import { useMemo, useState } from "react";
import BaseMap from "@/components/map/base-map.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
// import BubbleChartLayer, {
//   type CensusBlockData,
// } from "@/components/map/bubble-chart-layer.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import type { StateProps, CountyProps } from "@/types/map.ts";
import type { StateChoroplethOption } from "@/constants/choropleth.ts";
import { ChoroplethLegend } from "@/components/map/choropleth-legend";
import { CvapRegistrationLegend } from "@/components/map/cvap-registration-legend";
import type { ActiveVotersData as ActiveVotersTableData } from "@/components/table/state-tables/active-voters-columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/table/data-table";
import {
  sampleVotersColumns,
  type SampleVoterRow,
} from "@/components/table/county-modal-columns";

/** ---------- Types ---------- */
interface StateMapProps {
  currentStateData: FeatureCollection<Geometry, StateProps>;
  currentCountiesData: FeatureCollection<Geometry, CountyProps> | null;
  isDetailedState: boolean;
  choroplethOption?: StateChoroplethOption;
  // censusBlockData?: CensusBlockData[];
  showBubbleChart?: boolean;
  votingEquipmentData?: Array<{
    eavsRegion: string;
    equipmentTypes: string[];
    primaryEquipment: string;
  }>;
  showCvapLegend?: boolean;
  cvapLegendData?: ActiveVotersTableData[];
}

type SafeCounty = {
  name: string;
  statefp: string; // e.g., "01"
  countyfp: string; // e.g., "001"
  geoid: string; // e.g., "01001"
};

type Party = "Democrat" | "Republican";

type Voter = {
  id: string;
  name: string;
  email: string;
  party: Party;
  registered: boolean;
  mailInVote: boolean;
  zip: string;
};

type PartyStats = {
  party: Party;
  count: number;
  pct: number;
};

type DummyVoterData = {
  geoid: string;
  total: number;
  byParty: PartyStats[];
  votersSample: Voter[];
};

/** ---------- Utils: schema-safe, seeded RNG, dummy gen ---------- */
function toSafeCounty(props: unknown): SafeCounty {
  const p = (props ?? {}) as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = p[k];
      if (v != null && v !== "") return String(v);
    }
    return "";
  };

  return {
    name: pick("NAME", "name") || "Unknown County",
    statefp: pick("STATEFP", "state", "STATE", "state_code") || "N/A",
    countyfp: pick("COUNTYFP", "county_code") || "N/A",
    geoid:
      pick("GEOID", "FIPS", "fips", "id") ||
      `FAKE-${Math.floor(Math.random() * 10000)}`,
  };
}

// Simple deterministic string hash → 32-bit int
function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 PRNG
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Alex",
  "Taylor",
  "Jordan",
  "Casey",
  "Riley",
  "Morgan",
  "Avery",
  "Sam",
  "Jamie",
  "Cameron",
  "Devin",
  "Quinn",
  "Parker",
  "Drew",
  "Reese",
  "Rowan",
  "Elliot",
  "Kyle",
  "Logan",
  "Harper",
];
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Brown",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
  "Clark",
  "Rodriguez",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
];

// Random-ish 3-letter “ZIP” token for demo
const ZIPS = [
  "MIA",
  "LAX",
  "NYC",
  "SEA",
  "DAL",
  "ATL",
  "PHL",
  "BOS",
  "DEN",
  "PHX",
  "MSP",
  "DTW",
  "CLT",
  "HOU",
  "SFO",
];

function pickOne<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function makeEmail(name: string, r: () => number): string {
  const providers = ["example.com", "mail.com", "inbox.com", "post.com"];
  const handle =
    name.toLowerCase().replace(/\s+/g, ".") + Math.floor(r() * 100);
  return `${handle}@${pickOne(providers, r)}`;
}

// Given a seed, produce stable party distribution that still "looks random"
function partyMix(rand: () => number): [number, number, number] {
  // Draw two points on simplex and normalize to 100
  const d = rand() * 0.6 + 0.2; // 20–80%
  const r = rand() * (1 - d);
  const o = 1 - d - r;
  // randomize which party is "strong"
  const roll = rand();
  let dem = d,
    rep = r,
    oth = o;
  if (roll < 0.33) [dem, rep] = [rep, dem];
  else if (roll < 0.66) [dem, oth] = [oth, dem];
  // percentages as integers that sum to 100
  const D = Math.max(5, Math.round(dem * 100));
  const R = Math.max(5, Math.round(rep * 100));
  let O = Math.max(2, 100 - D - R);
  // re-balance if rounding pushed sum off
  const diff = 100 - (D + R + O);
  if (diff !== 0) O += diff;
  return [D, R, O];
}

function generateDummyVoters(geoid: string, countHint = 180): DummyVoterData {
  const seed = hash32(geoid);
  const r = mulberry32(seed);

  // Total voters between ~120 and ~420
  const total = Math.floor(countHint * (0.7 + r() * 1.6));

  const [demPct, repPct] = partyMix(r);
  const demCount = Math.round((demPct / 100) * total);
  const repCount = Math.round((repPct / 100) * total);

  const voters: Voter[] = [];
  const mkVoter = (party: Party): Voter => {
    const name = `${pickOne(FIRST_NAMES, r)} ${pickOne(LAST_NAMES, r)}`;
    return {
      id: Math.floor(r() * 0xffffffff)
        .toString(16)
        .padStart(8, "0"),
      name,
      email: makeEmail(name, r),
      party,
      registered: r() > 0.05, // ~95% registered
      mailInVote: r() > 0.7, // ~30% mail-in
      zip: pickOne(ZIPS, r),
    };
  };

  for (let i = 0; i < demCount; i++) voters.push(mkVoter("Democrat"));
  for (let i = 0; i < repCount; i++) voters.push(mkVoter("Republican"));

  // Stable shuffle based on seed (Fisher–Yates using r)
  for (let i = voters.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [voters[i], voters[j]] = [voters[j], voters[i]];
  }

  const sample = voters.slice(0, 12); // keep modal light

  const byParty: PartyStats[] = [
    { party: "Democrat", count: demCount, pct: demPct },
    { party: "Republican", count: repCount, pct: repPct },
  ];

  return { geoid, total, byParty, votersSample: sample };
}

/** ---------- Component ---------- */
export default function StateMap({
  currentStateData,
  currentCountiesData,
  isDetailedState,
  choroplethOption,
  // censusBlockData = [],
  // showBubbleChart = false,
  votingEquipmentData = [],
  showCvapLegend = false,
  cvapLegendData = [],
}: StateMapProps) {
  const [selectedCounty, setSelectedCounty] = useState<SafeCounty | null>(null);
  const [partyFilter, setPartyFilter] = useState<string>("all");

  // Generate dummy voter data whenever county changes
  const voterData = useMemo<DummyVoterData | null>(() => {
    if (!selectedCounty?.geoid) return null;
    return generateDummyVoters(selectedCounty.geoid);
  }, [selectedCounty?.geoid]);

  const handleCountyChange = (county: SafeCounty | null) => {
    setSelectedCounty(county);
    setPartyFilter("all"); // Reset filter when county changes
  };

  // Prepare data for Sample Voters table - filter by registered voters and party
  const sampleVotersData: SampleVoterRow[] = useMemo(() => {
    if (!voterData) return [];

    // Filter for registered voters only
    let filtered = voterData.votersSample.filter((voter) => voter.registered);

    // Apply party filter
    if (partyFilter === "Republican" || partyFilter === "Democrat") {
      filtered = filtered.filter((voter) => voter.party === partyFilter);
    }

    return filtered;
  }, [voterData, partyFilter]);

  return (
    <div className="relative overflow-hidden h-screen">
      <div className="w-full h-full">
        <BaseMap
          center={[39, -97]}
          zoom={4}
          style={{ width: "100%", height: "78%", zIndex: 0 }}
          fitToGeoJSON={currentStateData}
        >
          {isDetailedState && currentCountiesData ? (
            <>
              <ChoroplethLayer
                data={currentCountiesData}
                choroplethOption={choroplethOption}
                stateView
              />
              <OutlineLayer
                data={currentCountiesData}
                stateView
                onFeatureClick={(feature) => {
                  const props = feature?.properties ?? null;
                  handleCountyChange(props ? toSafeCounty(props) : null);
                }}
              />
            </>
          ) : (
            <>
              <ChoroplethLayer
                data={currentStateData}
                choroplethOption={choroplethOption}
                stateView
              />
              <OutlineLayer data={currentStateData} stateView />
            </>
          )}

          {/* <BubbleChartLayer data={censusBlockData} visible={showBubbleChart} /> */}
        </BaseMap>

        {/* Choropleth Legend - positioned on the map */}
        {choroplethOption && choroplethOption !== "off" && (
          <div className="absolute bottom-32 left-4 z-10 max-w-xs">
            <ChoroplethLegend
              choroplethOption={choroplethOption}
              votingEquipmentData={votingEquipmentData}
            />
          </div>
        )}
        {showCvapLegend && cvapLegendData.length > 0 ? (
          <div className="absolute bottom-32 right-4 z-10 max-w-xs">
            <CvapRegistrationLegend data={cvapLegendData} />
          </div>
        ) : null}
      </div>

      {/* Modal */}
      <Dialog
        open={!!selectedCounty}
        onOpenChange={(open) => !open && handleCountyChange(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCounty?.name ?? "County Details"}
            </DialogTitle>
          </DialogHeader>

          {/* Sample voters */}
          <div className="flex flex-col mt-2 gap-4">
            <div className="flex items-center justify-end gap-2 mb-2">
              <label className="text-sm text-muted-foreground">
                Filter by Party:
              </label>
              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Parties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  <SelectItem value="Republican">Republican</SelectItem>
                  <SelectItem value="Democrat">Democratic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DataTable
              data={sampleVotersData}
              columns={sampleVotersColumns}
              pageSize={10}
              showPagination={true}
              bodyClassName="text-sm"
              tableContainerClassName="rounded-lg"
              emptyMessage="No registered voters match the selected criteria."
              toolbar={
                <h3 className="text-sm font-semibold mb-2">
                  Registered Voters
                </h3>
              }
            />
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="secondary" size="sm">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
