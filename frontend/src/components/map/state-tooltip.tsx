import type { StateDetails } from "@/constants/states";

interface StateTooltipProps {
  stateName: string;
  details?: StateDetails;
}

export function StateTooltip({ stateName, details }: StateTooltipProps) {
  return (
    <div
      className={`p-2.5 font-sans bg-white/95 backdrop-blur-md shadow-xl rounded-lg ${details ? "min-w-[200px]" : ""}`}
    >
      <h3
        className={`text-sm font-bold text-gray-900 ${details ? "mb-2 pb-1" : ""}`}
      >
        {stateName}
      </h3>
      {details && (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-600">Registration Type:</span>
            <span className="font-semibold capitalize text-gray-900">
              {details.registrationType}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-600">Same Day Reg:</span>
            <span className="font-semibold text-gray-900">
              {details.sameDayRegistration ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-600">Political Party State:</span>
            <span className="font-semibold text-gray-900">
              {details.politicalPartyState ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-600">Detailed Voter Data:</span>
            <span className="font-semibold text-gray-900">
              {details.hasDetailedVoterData ? "Available" : "Limited"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
