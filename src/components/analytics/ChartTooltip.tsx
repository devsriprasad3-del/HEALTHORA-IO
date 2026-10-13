import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly any[] | any[];
  label?: string | number;
  unit?: string;
  titlePrefix?: string;
}

export const ChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  unit = "",
  titlePrefix = "",
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[#101C31] text-white p-3 rounded-xl border border-[#1B2D48] shadow-xl text-xs z-50 min-w-[140px]">
      <div className="font-semibold text-slate-300 pb-1.5 mb-1.5 border-b border-[#1B2D48] flex items-center justify-between gap-2">
        <span>{titlePrefix ? `${titlePrefix}: ${label}` : label}</span>
      </div>
      <div className="space-y-1">
        {payload.map((item: any, idx: number) => {
          const val = item.value;
          const displayVal =
            val === null || val === undefined
              ? "Not recorded"
              : typeof val === "number"
              ? `${val.toLocaleString()} ${unit || item.unit || ""}`
              : `${val} ${unit || ""}`;

          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color || item.fill || "#14B8A6" }}
                />
                {item.name || "Value"}:
              </span>
              <span className="font-mono font-bold text-white text-[11px]">
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
