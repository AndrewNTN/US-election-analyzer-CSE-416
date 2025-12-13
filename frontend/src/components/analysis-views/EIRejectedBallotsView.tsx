import RejectedBallotsPDF from "../chart/ei-rejected-ballots";

interface EIRejectedBallotsViewProps {
    stateFipsPrefix: string | undefined;
}

import { useEIRejectedBallotsDataQuery } from "@/lib/api/use-ei-queries";
import { useMemo } from "react";

const DEMOGRAPHIC_GROUPS: ("white" | "black" | "hispanic" | "asian")[] = [
    "white",
    "black",
    "hispanic",
    "asian",
];

export function EIRejectedBallotsView({
    stateFipsPrefix,
}: EIRejectedBallotsViewProps) {
    const { data, isLoading, isError } = useEIRejectedBallotsDataQuery(stateFipsPrefix);

    const chartData = useMemo(() => {
        if (!data || !data.demographics) return [];

        const firstGroupKey = Object.keys(data.demographics)[0];
        if (!firstGroupKey) return [];
        const firstGroup = data.demographics[firstGroupKey];
        const firstPoints = firstGroup["Rejected"] || [];

        return firstPoints.map((p, i) => {
            const row: any = { ratePct: p.x * 100 }; // Convert to percentage
            Object.entries(data.demographics).forEach(([group, candidates]) => {
                const key = group.toLowerCase();
                if (candidates["Rejected"] && candidates["Rejected"][i]) {
                    row[key] = candidates["Rejected"][i].y;
                }
            });
            return row;
        });
    }, [data]);

    if (!stateFipsPrefix) {
        return (
            <div className="h-[600px] flex items-center justify-center">
                <div className="text-gray-500">No state selected</div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-[600px] flex items-center justify-center">
                <div className="text-gray-500">Loading analysis data...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-[600px] flex items-center justify-center">
                <div className="text-red-500">Error loading analysis data</div>
            </div>
        );
    }

    return (
        <div className="h-[650px]">
            <h3 className="text-lg font-semibold mb-2">
                Rejected Ballots by Demographics
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Posterior density distribution of rejected ballot rates across
                demographic groups. Shows the estimated probability of ballot rejection
                rates by race/ethnicity.
            </p>
            <RejectedBallotsPDF
                data={chartData}
                groups={DEMOGRAPHIC_GROUPS}
                xLabel="Rejected Ballot Rate (%)"
                yLabel="Posterior Density"
            />
        </div>
    );
}
