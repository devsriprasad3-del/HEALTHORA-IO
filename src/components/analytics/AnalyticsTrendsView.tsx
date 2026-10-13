import React, { useState, useEffect } from "react";
import { AnalyticsOverview } from "./AnalyticsOverview.js";
import { DateRangePreset } from "./DateRangeFilter.js";
import { useAuth } from "../../context/AuthContext.js";
import { ViewTab } from "../../types/health.js";
import { getAuthHeaders } from "../../lib/supabaseClient.js";
import { TrendingUp, RefreshCw } from "lucide-react";

interface AnalyticsTrendsViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  onLaunchAIBotWithContext?: (pageContext: string, initialPrompt?: string) => void;
}

export const AnalyticsTrendsView: React.FC<AnalyticsTrendsViewProps> = ({
  onNavigateTab,
  onLaunchAIBotWithContext,
}) => {
  const { user, activeProfileKey } = useAuth();

  const [range, setRange] = useState<DateRangePreset>("7d");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [trendData, setTrendData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async (
    selectedRange: DateRangePreset,
    customStart?: string,
    customEnd?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/analytics/trends?range=${selectedRange}`;
      if (selectedRange === "custom" && customStart && customEnd) {
        url += `&startDate=${customStart}&endDate=${customEnd}`;
      }

      const headers = await getAuthHeaders(user?.id);
      const res = await fetch(url, { headers });

      if (!res.ok) {
        throw new Error(`Failed to load analytics: ${res.statusText}`);
      }

      const data = await res.json();
      setTrendData(data);
    } catch (err: any) {
      console.error("Failed to load analytics trends:", err);
      setError(err?.message || "Failed to load analytics trends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(range, startDate, endDate);
  }, [range, startDate, endDate, activeProfileKey]);

  const handleRangeChange = (
    newPreset: DateRangePreset,
    customStart?: string,
    customEnd?: string
  ) => {
    setRange(newPreset);
    if (newPreset === "custom") {
      setStartDate(customStart);
      setEndDate(customEnd);
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const handleRefresh = () => {
    fetchTrends(range, startDate, endDate);
  };

  if (loading && !trendData) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#14B8A6] animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Loading Healthora 2.0 Analytics...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Calculating statistical trajectories from verified user health logs
        </p>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          No analytics data available yet
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#12998a] text-slate-900 font-bold text-xs transition-colors"
        >
          Load Analytics
        </button>
      </div>
    );
  }

  return (
    <AnalyticsOverview
      trendData={trendData}
      loading={loading}
      range={range}
      startDate={startDate}
      endDate={endDate}
      onRangeChange={handleRangeChange}
      onRefresh={handleRefresh}
      onNavigateTab={onNavigateTab}
      onLaunchAIBotWithContext={onLaunchAIBotWithContext}
    />
  );
};
