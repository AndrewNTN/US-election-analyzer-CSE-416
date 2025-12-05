import type { StateDetails } from "@/constants/states";

interface StateTooltipProps {
  stateName: string;
  details?: StateDetails;
}

export function StateTooltip({ stateName, details }: StateTooltipProps) {
  return (
    <div
      className={`p-4 font-sans bg-white/95 backdrop-blur-md shadow-2xl rounded-xl ${details ? "min-w-[260px]" : ""}`}
    >
      <h3
        className={`text-lg font-bold text-gray-900 ${details ? "mb-3 pb-2" : ""}`}
      >
        {stateName}
      </h3>
      {details && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Registration Type:</span>
            <span className="font-semibold capitalize text-gray-900">
              {details.registrationType}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Same Day Reg:</span>
            <span className="font-semibold text-gray-900">
              {details.sameDayRegistration ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Political Party State:</span>
            <span className="font-semibold text-gray-900">
              {details.politicalPartyState ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex items-center justify-between">
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
