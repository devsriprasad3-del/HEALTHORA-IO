import React from "react";
import { Sparkles, CheckCircle2, AlertCircle, Info, ArrowRight, Bot } from "lucide-react";

export interface AnalyticsInsight {
  id: string;
  type: "positive" | "neutral" | "observation";
  category: string;
  title: string;
  message: string;
}

interface InsightsPanelProps {
  insights: AnalyticsInsight[];
  onAskCopilot?: (context: string) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  onAskCopilot,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "observation":
        return <Info className="w-4 h-4 text-[#14B8A6]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleLaunchCopilot = () => {
    if (onAskCopilot) {
      const summaryText = insights.map((i) => `• ${i.title}: ${i.message}`).join("\n");
      onAskCopilot(`I would like to explore my recent health analytics and logging patterns:\n${summaryText}`);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6]">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              Data-Grounded Pattern Observations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Objective reflections from your recorded metrics. Not a clinical psychiatric or medical diagnosis.
            </p>
          </div>
        </div>

        {onAskCopilot && (
          <button
            onClick={handleLaunchCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-[#14B8A6] text-xs font-bold transition-all border border-[#14B8A6]/20 shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Consult AI Copilot</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        )}
      </div>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {insights.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#14233A] border border-[#E2E8F0] dark:border-[#1B2D48] flex items-start gap-3"
            >
              <span className="mt-0.5 shrink-0">{getIcon(item.type)}</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-slate-50 dark:bg-[#14233A] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log entries across consecutive days to generate personalized pattern observations.
          </p>
        </div>
      )}
    </div>
  );
};
