import { useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";
import BaseMap from "@/components/map/base-map.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
import BubbleChartLayer, { type CensusBlockData } from "@/components/map/bubble-chart-layer.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import type { StateProps, CountyProps } from "@/types/map.ts";
import type { StateChoroplethOption } from "@/constants/choropleth.ts";
import { STATE_CHOROPLETH_OPTIONS } from "@/constants/choropleth.ts";
import { VotingEquipmentLegend } from "@/components/voting-equipment-legend.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** ---------- Types ---------- */
interface StateMapProps {
  currentStateData: FeatureCollection<Geometry, StateProps>;
  currentCountiesData: FeatureCollection<Geometry, CountyProps> | null;
  isDetailedState: boolean;
  choroplethOption?: StateChoroplethOption;
  censusBlockData?: CensusBlockData[];
  showBubbleChart?: boolean;
  votingEquipmentData?: Array<{
    eavsRegion: string;
    equipmentTypes: string[];
    primaryEquipment: string;
  }>;
}

type SafeCounty = {
  name: string;
  statefp: string;   // e.g., "01"
  countyfp: string;  // e.g., "001"
  geoid: string;     // e.g., "01001"
};

type Party = "Democrat" | "Republican" | "Other";

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
  pct: number; // 0-100
};

type DummyVoterData = {
  geoid: string;
  total: number;
  byParty: PartyStats[];
  votersSample: Voter[]; // subset to show in modal
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
    name:     pick("NAME", "name") || "Unknown County",
    statefp:  pick("STATEFP", "state", "STATE", "state_code") || "N/A",
    countyfp: pick("COUNTYFP", "county_code") || "N/A",
    geoid:    pick("GEOID", "FIPS", "fips", "id") || `FAKE-${Math.floor(Math.random()*10000)}`,
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
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Alex","Taylor","Jordan","Casey","Riley","Morgan","Avery","Sam","Jamie","Cameron",
  "Devin","Quinn","Parker","Drew","Reese","Rowan","Elliot","Kyle","Logan","Harper"
];
const LAST_NAMES = [
  "Smith","Johnson","Brown","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin",
  "Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall"
];

// Random-ish 3-letter “ZIP” token for demo
const ZIPS = ["MIA","LAX","NYC","SEA","DAL","ATL","PHL","BOS","DEN","PHX","MSP","DTW","CLT","HOU","SFO"];

function pickOne<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function makeEmail(name: string, r: () => number): string {
  const providers = ["example.com","mail.com","inbox.com","post.com"];
  const handle = name.toLowerCase().replace(/\s+/g, ".") + Math.floor(r() * 100);
  return `${handle}@${pickOne(providers, r)}`;
}

// Given a seed, produce stable party distribution that still “looks random”
function partyMix(rand: () => number): [number, number, number] {
  // Draw two points on simplex and normalize to 100
  let d = rand() * 0.6 + 0.2;  // 20–80%
  let r = rand() * (1 - d);
  let o = 1 - d - r;
  // randomize which party is “strong”
  const roll = rand();
  let dem = d, rep = r, oth = o;
  if (roll < 0.33) [dem, rep] = [rep, dem];
  else if (roll < 0.66) [dem, oth] = [oth, dem];
  // percentages as integers that sum to 100
  let D = Math.max(5, Math.round(dem * 100));
  let R = Math.max(5, Math.round(rep * 100));
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

  const [demPct, repPct, othPct] = partyMix(r);
  const demCount = Math.round((demPct / 100) * total);
  const repCount = Math.round((repPct / 100) * total);
  let othCount = total - demCount - repCount;

  const voters: Voter[] = [];
  const mkVoter = (party: Party): Voter => {
    const name = `${pickOne(FIRST_NAMES, r)} ${pickOne(LAST_NAMES, r)}`;
    return {
      id: Math.floor(r() * 0xffffffff).toString(16).padStart(8, "0"),
      name,
      email: makeEmail(name, r),
      party,
      registered: r() > 0.05,           // ~95% registered
      mailInVote: r() > 0.7,            // ~30% mail-in
      zip: pickOne(ZIPS, r),
    };
  };

  for (let i = 0; i < demCount; i++) voters.push(mkVoter("Democrat"));
  for (let i = 0; i < repCount; i++) voters.push(mkVoter("Republican"));
  for (let i = 0; i < othCount; i++) voters.push(mkVoter("Other"));

  // Stable shuffle based on seed (Fisher–Yates using r)
  for (let i = voters.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [voters[i], voters[j]] = [voters[j], voters[i]];
  }

  const sample = voters.slice(0, 12); // keep modal light

  const byParty: PartyStats[] = [
    { party: "Democrat",   count: demCount, pct: demPct },
    { party: "Republican", count: repCount, pct: repPct },
    { party: "Other",      count: othCount, pct: othPct },
  ];

  return { geoid, total, byParty, votersSample: sample };
}

/** ---------- Component ---------- */
export default function StateMap({
  currentStateData,
  currentCountiesData,
  isDetailedState,
  choroplethOption,
  censusBlockData = [],
  showBubbleChart = false,
  votingEquipmentData = [],
}: StateMapProps) {
  const showEquipmentLegend =
    choroplethOption === STATE_CHOROPLETH_OPTIONS.VOTING_EQUIPMENT_TYPE &&
    votingEquipmentData.length > 0;

  const [selectedCounty, setSelectedCounty] = useState<SafeCounty | null>(null);

  const transparentStyle = useMemo(
    () => ({ color: "#000000", weight: 0, opacity: 0, fillOpacity: 0 }),
    []
  );

  // Generate dummy voter data whenever county changes
  const voterData = useMemo<DummyVoterData | null>(() => {
    if (!selectedCounty?.geoid) return null;
    return generateDummyVoters(selectedCounty.geoid);
  }, [selectedCounty?.geoid]);

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
              <ChoroplethLayer data={currentCountiesData} choroplethOption={choroplethOption} stateView />
              <OutlineLayer data={currentCountiesData} stateView />

              {/* Click-only overlay */}
              <GeoJSON
                data={currentCountiesData as any}
                style={() => transparentStyle}
                eventHandlers={{
                  click: (e: any) => {
                    const props =
                      e?.sourceTarget?.feature?.properties ??
                      e?.layer?.feature?.properties ??
                      e?.target?.feature?.properties ??
                      null;
                    setSelectedCounty(props ? toSafeCounty(props) : null);
                  },
                }}
              />
            </>
          ) : (
            <>
              <ChoroplethLayer data={currentStateData} choroplethOption={choroplethOption} stateView />
              <OutlineLayer data={currentStateData} stateView />
            </>
          )}

          <BubbleChartLayer data={censusBlockData} visible={showBubbleChart} />
        </BaseMap>

        {/* Voting Equipment Legend - positioned on the map */}
        {showEquipmentLegend && (
          <div className="absolute bottom-4 left-4 z-10 max-w-xs">
            <VotingEquipmentLegend data={votingEquipmentData} />
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={!!selectedCounty} onOpenChange={(open) => !open && setSelectedCounty(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCounty?.name ?? "County Details"}</DialogTitle>
            <DialogDescription>
              GEOID: {selectedCounty?.geoid ?? "N/A"} • StateFP: {selectedCounty?.statefp ?? "N/A"} • CountyFP: {selectedCounty?.countyfp ?? "N/A"}
            </DialogDescription>
          </DialogHeader>

          {/* Party breakdown */}
          <div className="mt-2">
            <h3 className="text-sm font-semibold mb-2">Party Breakdown</h3>
            <div className="overflow-x-auto rounded-2xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Party</th>
                    <th className="px-3 py-2 text-right">Count</th>
                    <th className="px-3 py-2 text-right">Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {voterData?.byParty.map((row) => (
                    <tr key={row.party} className="border-t">
                      <td className="px-3 py-2">{row.party}</td>
                      <td className="px-3 py-2 text-right">{row.count.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{row.pct}%</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{voterData?.total.toLocaleString() ?? "—"}</td>
                    <td className="px-3 py-2 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample voters */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Sample Voters (12)</h3>
            <div className="overflow-x-auto rounded-2xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Party</th>
                    <th className="px-3 py-2 text-left">ZIP</th>
                    <th className="px-3 py-2 text-left">Registered</th>
                    <th className="px-3 py-2 text-left">Mail-in</th>
                  </tr>
                </thead>
                <tbody>
                  {voterData?.votersSample.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="px-3 py-2">{v.name}</td>
                      <td className="px-3 py-2">{v.email}</td>
                      <td className="px-3 py-2">{v.party}</td>
                      <td className="px-3 py-2">{v.zip}</td>
                      <td className="px-3 py-2">{v.registered ? "Yes" : "No"}</td>
                      <td className="px-3 py-2">{v.mailInVote ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                  {!voterData && (
                    <tr>
                      <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                        Click a county to generate sample voters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
