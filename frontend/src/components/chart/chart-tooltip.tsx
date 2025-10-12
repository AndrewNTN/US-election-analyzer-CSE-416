import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

export interface ChartTooltipOptions {
  labelFormatter?: (label: string | number | undefined) => string;
  valueFormatter?: (value: ValueType) => string;
  unitLabel?: string;
  hideLabel?: boolean;
  className?: string;
}

export interface ChartTooltipProps extends ChartTooltipOptions {
  active?: boolean;
  payload?: Array<{
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
    color?: string;
    [key: string]: unknown;
  }>;
  label?: string | number;
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  unitLabel,
  hideLabel,
  className,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const [{ value }] = payload;

  const displayLabel = labelFormatter ? labelFormatter(label) : label;
  const displayValue = (() => {
    if (valueFormatter && value !== undefined) {
      return valueFormatter(value);
    }

    if (typeof value === "number") {
      return value.toLocaleString();
    }

    return value;
  })();

  return (
    <div
      className={`rounded-lg bg-white px-3 py-2 text-sm leading-snug text-gray-800 shadow-lg border border-gray-200 ${
        className ?? ""
      }`}
    >
      {!hideLabel && displayLabel !== undefined && displayLabel !== null && (
        <div className="font-semibold">{displayLabel}</div>
      )}
      <div>
        {displayValue}
        {unitLabel ? ` ${unitLabel}` : ""}
      </div>
    </div>
  );
}
