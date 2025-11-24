import { useMemo, useState } from "react";
import BaseMap from "@/components/map/base-map.tsx";
import OutlineLayer from "@/components/map/outline-layer.tsx";
import ChoroplethLayer from "@/components/map/choropleth-layer.tsx";
// import BubbleChartLayer, {
//   type CensusBlockData,
// } from "@/components/map/bubble-chart-layer.tsx";
import type { FeatureCollection, Geometry } from "geojson";
import type { StateProps, CountyProps } from "@/lib/api/geojson-requests";
import { useFloridaVotersQuery } from "@/lib/api/use-queries.ts";
import type { StateChoroplethOption } from "@/lib/choropleth.ts";
import {
  generateColorScale,
  CHOROPLETH_COLORS,
  STATE_CHOROPLETH_OPTIONS,
} from "@/lib/choropleth";
import { ChoroplethLegend } from "@/components/map/choropleth-legend";
import { CvapRegistrationLegend } from "@/components/map/cvap-registration-legend";
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
import { generateVoterColumns } from "@/components/table/county-modal-columns";

/** ---------- Types ---------- */
interface StateMapProps {
  currentStateData: FeatureCollection<Geometry, StateProps>;
  currentCountiesData: FeatureCollection<Geometry, CountyProps> | null;
  isDetailedState: boolean;
  choroplethOption?: StateChoroplethOption;
  // censusBlockData?: CensusBlockData[];
  showBubbleChart?: boolean;
  showCvapLegend?: boolean;
  fipsPrefix?: string | null;
  hasDetailedVoterData?: boolean;
}

/** ---------- Component ---------- */
export default function StateMap({
  currentStateData,
  currentCountiesData,
  isDetailedState,
  choroplethOption,
  // censusBlockData = [],
  // showBubbleChart = false,
  showCvapLegend = false,
  fipsPrefix,
  hasDetailedVoterData = false,
}: StateMapProps) {
  const [selectedCounty, setSelectedCounty] = useState<CountyProps | null>(
    null,
  );
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 11,
  });
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);

  // Fetch real voter data when a county is selected
  const sortParam =
    sorting.length > 0
      ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
      : undefined;

  const { data: votersResponse, isLoading: isVotersLoading } =
    useFloridaVotersQuery(
      selectedCounty?.countyName || null,
      pagination.pageIndex,
      pagination.pageSize,
      sortParam,
      partyFilter,
    );

  const handleCountyChange = (county: CountyProps | null) => {
    setSelectedCounty(county);
    setPartyFilter("all"); // Reset filter when county changes
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize }); // Reset pagination
    setSorting([{ id: "name", desc: false }]); // Reset sorting
  };

  // Prepare data for Voters table - filter by registered voters and party
  const votersData = useMemo(() => {
    if (!votersResponse) return [];
    return votersResponse.voters;
  }, [votersResponse]);

  // Calculate dynamic color scale based on the current data and option
  const dynamicScale = useMemo(() => {
    const data =
      isDetailedState && currentCountiesData
        ? currentCountiesData
        : currentStateData;
    if (choroplethOption === "off" || !data?.features) return null;

    const values: number[] = [];
    data.features.forEach((f) => {
      if (!f.properties) return;
      const props = f.properties as unknown as Record<string, unknown>;
      let val: number | undefined;

      switch (choroplethOption) {
        case STATE_CHOROPLETH_OPTIONS.PROVISIONAL_BALLOTS:
          val =
            "PROVISIONAL_BALLOTS_PCT" in props
              ? (props.PROVISIONAL_BALLOTS_PCT as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.ACTIVE_VOTERS:
          val =
            "ACTIVE_VOTERS_PCT" in props
              ? (props.ACTIVE_VOTERS_PCT as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.POLLBOOK_DELETIONS:
          val =
            "POLLBOOK_DELETIONS_PCT" in props
              ? (props.POLLBOOK_DELETIONS_PCT as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.MAIL_BALLOTS_REJECTED:
          val =
            "MAIL_BALLOTS_REJECTED_PCT" in props
              ? (props.MAIL_BALLOTS_REJECTED_PCT as number)
              : undefined;
          break;
        case STATE_CHOROPLETH_OPTIONS.VOTER_REGISTRATION:
          val =
            "VOTER_REGISTRATION_PCT" in props
              ? (props.VOTER_REGISTRATION_PCT as number)
              : undefined;
          if (val !== undefined && val > 100) val = 100;
          break;
      }

      if (val !== undefined && val !== null && !isNaN(val)) {
        values.push(val);
      }
    });

    return generateColorScale(values, CHOROPLETH_COLORS.slice(0, 6));
  }, [
    currentStateData,
    currentCountiesData,
    isDetailedState,
    choroplethOption,
  ]);

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
                key={`${choroplethOption}-${Boolean(currentCountiesData?.features?.[0]?.properties && "PROVISIONAL_BALLOTS_PCT" in currentCountiesData.features[0].properties)}`}
                data={currentCountiesData}
                choroplethOption={choroplethOption}
                stateView
                colorScale={dynamicScale}
              />
              <OutlineLayer
                key={`outline-${choroplethOption}`}
                data={currentCountiesData}
                stateView
                enableCountyInteractions={hasDetailedVoterData}
                onFeatureClick={
                  hasDetailedVoterData
                    ? (feature) => {
                        const props = feature?.properties as CountyProps | null;
                        handleCountyChange(props);
                      }
                    : undefined
                }
              />
            </>
          ) : (
            <>
              <ChoroplethLayer
                data={currentStateData}
                choroplethOption={choroplethOption}
                stateView
                colorScale={dynamicScale}
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
              colorScale={dynamicScale}
            />
          </div>
        )}
        {showCvapLegend ? (
          <div className="absolute bottom-32 right-4 z-10 max-w-xs">
            <CvapRegistrationLegend fipsPrefix={fipsPrefix} />
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
              {selectedCounty?.countyName ?? "County Details"}
            </DialogTitle>
          </DialogHeader>

          {/* Voters table */}
          <div className="flex flex-col mt-2 gap-4">
            <div className="flex items-center justify-end gap-2 mb-2">
              <label className="text-sm">Filter by Party:</label>
              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Parties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  <SelectItem value="Republican">Republican</SelectItem>
                  <SelectItem value="Democrat">Democrat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DataTable
              data={votersData}
              columns={generateVoterColumns(votersResponse?.metricLabels)}
              pageSize={pagination.pageSize}
              showPagination={true}
              manualPagination={true}
              pageCount={votersResponse?.totalPages ?? 1}
              state={{
                pagination,
                sorting,
              }}
              onPaginationChange={setPagination}
              onSortingChange={setSorting}
              bodyClassName="text-sm"
              tableContainerClassName="rounded-lg min-h-[24rem] px-3 flex flex-col justify-center"
              emptyMessage={
                isVotersLoading
                  ? "Loading voters..."
                  : "No registered voters match the selected criteria."
              }
              toolbar={
                <h3 className="text-sm font-semibold mb-2">
                  Registered Voters
                </h3>
              }
            />
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
