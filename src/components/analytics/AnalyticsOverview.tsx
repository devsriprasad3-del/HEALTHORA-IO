import React, { useState } from "react";
import {
  TrendingUp,
  Moon,
  Droplets,
  Activity,
  Utensils,
  Smile,
  FlaskConical,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Flame,
} from "lucide-react";
import { MetricCard } from "./MetricCard.js";
import { DateRangeFilter, DateRangePreset } from "./DateRangeFilter.js";
import { InteractivePieChart } from "./InteractivePieChart.js";
import { TrendChart } from "./TrendChart.js";
import { ComparisonBarChart } from "./ComparisonBarChart.js";
import { HealthProgressChart } from "./HealthProgressChart.js";
import { CalendarActivityHeatmap } from "./CalendarActivityHeatmap.js";
import { LabTrendExplorer } from "./LabTrendExplorer.js";
import { DataBreakdownTable, MetricAnalysisRow } from "./DataBreakdownTable.js";
import { InsightsPanel } from "./InsightsPanel.js";
import { ChartExportMenu } from "./ChartExportMenu.js";
import { ViewTab } from "../../types/health.js";

interface AnalyticsOverviewProps {
  trendData: any;
  loading: boolean;
  range: DateRangePreset;
  startDate?: string;
  endDate?: string;
  onRangeChange: (preset: DateRangePreset, customStart?: string, customEnd?: string) => void;
  onRefresh: () => void;
  onNavigateTab: (tab: ViewTab) => void;
  onLaunchAIBotWithContext?: (pageContext: string, initialPrompt?: string) => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  trendData,
  loading,
  range,
  startDate,
  endDate,
  onRangeChange,
  onRefresh,
  onNavigateTab,
  onLaunchAIBotWithContext,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<"trends" | "breakdowns" | "matrix">("trends");

  const summary = trendData?.summaryMetrics || {};

  // Build the 8 Metric Rows for the Detailed Analysis Table
  const breakdownRows: MetricAnalysisRow[] = [
    {
      key: "sleep",
      category: "Sleep Duration",
      unit: "hrs",
      total: summary.sleep?.totalHours ?? null,
      average: summary.sleep?.currentValue ?? null,
      median: summary.sleep?.medianHours ?? null,
      min: summary.sleep?.minHours ?? null,
      max: summary.sleep?.maxHours ?? null,
      recordedDays: summary.sleep?.recordedDays || 0,
      missingDays: summary.sleep?.missingDays || (trendData?.totalDays || 7),
      coveragePercent: summary.sleep?.coveragePercent || 0,
      previousValue: summary.sleep?.previousValue ?? null,
      percentChange: summary.sleep?.percentChange ?? null,
      latestRecordDate: summary.sleep?.latestRecordDate || null,
    },
    {
      key: "water",
      category: "Daily Hydration",
      unit: "ml",
      total: summary.waterTotal?.currentValue ?? null,
      average: summary.waterAvg?.currentValue ?? null,
      median: summary.waterTotal?.medianMl ?? null,
      min: summary.waterTotal?.minMl ?? null,
      max: summary.waterTotal?.maxMl ?? null,
      recordedDays: summary.waterTotal?.recordedDays || 0,
      missingDays: summary.waterTotal?.missingDays || (trendData?.totalDays || 7),
      coveragePercent: summary.waterTotal?.coveragePercent || 0,
      previousValue: summary.waterAvg?.previousValue ?? null,
      percentChange: summary.waterAvg?.percentChange ?? null,
      latestRecordDate: summary.waterTotal?.latestRecordDate || null,
    },
    {
      key: "activity",
      category: "Physical Activity",
      unit: "mins",
      total: summary.activityDuration?.currentValue ?? null,
      average: summary.activityDuration?.avgMinutes ?? null,
      median: summary.activityDuration?.medianMinutes ?? null,
      min: summary.activityDuration?.minMinutes ?? null,
      max: summary.activityDuration?.maxMinutes ?? null,
      recordedDays: summary.activityDuration?.recordedDays || 0,
      missingDays: summary.activityDuration?.missingDays || (trendData?.totalDays || 7),
      coveragePercent: summary.activityDuration?.coveragePercent || 0,
      previousValue: summary.activityDuration?.previousValue ?? null,
      percentChange: summary.activityDuration?.percentChange ?? null,
      latestRecordDate: summary.activityDuration?.latestRecordDate || null,
    },
    {
      key: "nutrition",
      category: "Dietary Intake",
      unit: "kcal",
      total: null,
      average: summary.calorieAverage?.currentValue ?? null,
      median: summary.calorieAverage?.medianKcal ?? null,
      min: summary.calorieAverage?.minKcal ?? null,
      max: summary.calorieAverage?.maxKcal ?? null,
      recordedDays: summary.mealsRecorded?.recordedDays || 0,
      missingDays: summary.mealsRecorded?.missingDays || (trendData?.totalDays || 7),
      coveragePercent: summary.mealsRecorded?.coveragePercent || 0,
      previousValue: summary.calorieAverage?.previousValue ?? null,
      percentChange: summary.calorieAverage?.percentChange ?? null,
      latestRecordDate: summary.mealsRecorded?.latestRecordDate || null,
    },
    {
      key: "documents",
      category: "Medical Records",
      unit: "files",
      total: summary.medicalDocuments?.totalDocs || 0,
      average: summary.medicalDocuments?.totalDocs || 0,
      median: null,
      min: null,
      max: null,
      recordedDays: summary.medicalDocuments?.categoryCount || 0,
      missingDays: 0,
      coveragePercent: 100,
      previousValue: null,
      percentChange: null,
      latestRecordDate: summary.medicalDocuments?.latestUploadDate || null,
    },
  ];

  // Goals for HealthProgressChart
  const targetProgressItems = [
    {
      label: "Sleep Duration",
      current: summary.sleep?.currentValue ?? null,
      target: 8.0,
      unit: "hrs/night",
      category: "sleep" as const,
    },
    {
      label: "Daily Hydration",
      current: summary.waterAvg?.currentValue ?? null,
      target: summary.waterAvg?.targetMl || 2500,
      unit: "ml/day",
      category: "water" as const,
    },
    {
      label: "Active Duration",
      current: summary.activityDuration?.avgMinutes ?? null,
      target: 45,
      unit: "mins/day",
      category: "activity" as const,
    },
  ];

  const getRangeLabel = () => {
    if (range === "custom") return `${startDate || ""} to ${endDate || ""}`;
    if (range === "today") return "Today";
    if (range === "30d") return "Last 30 Days";
    if (range === "90d") return "Last 90 Days";
    if (range === "this_month") return "This Month";
    if (range === "prev_month") return "Previous Month";
    return "Last 7 Days";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-[#101C31] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6]">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Analytics & Trends
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Understand your wellness patterns through your recorded health data
          </p>
        </div>

        {/* Date Range Filter & Export Menu */}
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangeFilter
            range={range}
            startDate={startDate}
            endDate={endDate}
            onRangeChange={onRangeChange}
            onRefresh={onRefresh}
            isRefreshing={loading}
          />

          <ChartExportMenu analyticsData={trendData} rangeLabel={range} />
        </div>
      </div>

      {/* 2. Primary 8 Summary Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Sleep Duration */}
        <MetricCard
          id="sleep"
          title="Average Sleep Duration"
          value={summary.sleep?.currentValue ?? null}
          unit="hrs/night"
          dateRangeLabel={getRangeLabel()}
          previousValue={summary.sleep?.previousValue ?? null}
          percentChange={summary.sleep?.percentChange ?? null}
          trendDirection={summary.sleep?.trendDirection ?? null}
          icon={<Moon className="w-4 h-4" />}
          iconBgColor="bg-indigo-50 dark:bg-indigo-950/40"
          iconColor="text-indigo-600 dark:text-indigo-400"
          sparklineData={summary.sleep?.sparkline}
          sparklineColor="#6366F1"
          emptyStateText="No sleep logged for this period"
          recordPromptText="Log sleep in Daily Tracking"
          onClickDetail={() => onNavigateTab("tracking")}
        />

        {/* Card 2: Total Recorded Water Intake */}
        <MetricCard
          id="waterTotal"
          title="Total Water Volume"
          value={summary.waterTotal?.currentValue ?? null}
          unit="ml"
          dateRangeLabel={getRangeLabel()}
          previousValue={summary.waterTotal?.previousValue ?? null}
          percentChange={summary.waterTotal?.percentChange ?? null}
          trendDirection={summary.waterTotal?.trendDirection ?? null}
          icon={<Droplets className="w-4 h-4" />}
          iconBgColor="bg-teal-50 dark:bg-teal-950/40"
          iconColor="text-[#14B8A6]"
          sparklineData={summary.waterTotal?.sparkline}
          sparklineColor="#14B8A6"
          emptyStateText="No water intake logged"
          recordPromptText="Log hydration in Daily Tracking"
          onClickDetail={() => onNavigateTab("tracking")}
        />

        {/* Card 3: Average Daily Water Intake */}
        <MetricCard
          id="waterAvg"
          title="Daily Hydration Average"
          value={summary.waterAvg?.currentValue ?? null}
          unit="ml/day"
          dateRangeLabel={`Target: ${summary.waterAvg?.targetMl || 2500} ml`}
          previousValue={summary.waterAvg?.previousValue ?? null}
          percentChange={summary.waterAvg?.percentChange ?? null}
          trendDirection={summary.waterAvg?.trendDirection ?? null}
          icon={<Droplets className="w-4 h-4" />}
          iconBgColor="bg-teal-50 dark:bg-teal-950/40"
          iconColor="text-[#14B8A6]"
          emptyStateText="Requires at least 1 hydration log"
          onClickDetail={() => onNavigateTab("tracking")}
        />

        {/* Card 4: Total Logged Activity Duration */}
        <MetricCard
          id="activityDuration"
          title="Active Exercise Duration"
          value={summary.activityDuration?.currentValue ?? null}
          unit="mins"
          dateRangeLabel={getRangeLabel()}
          previousValue={summary.activityDuration?.previousValue ?? null}
          percentChange={summary.activityDuration?.percentChange ?? null}
          trendDirection={summary.activityDuration?.trendDirection ?? null}
          icon={<Activity className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
          sparklineData={summary.activityDuration?.sparkline}
          sparklineColor="#10B981"
          emptyStateText="No physical activity recorded"
          recordPromptText="Log exercise in Daily Tracking"
          onClickDetail={() => onNavigateTab("tracking")}
        />

        {/* Card 5: Total Meals Recorded */}
        <MetricCard
          id="mealsRecorded"
          title="Total Meals Recorded"
          value={summary.mealsRecorded?.currentValue ?? null}
          unit="meals"
          dateRangeLabel={getRangeLabel()}
          previousValue={summary.mealsRecorded?.previousValue ?? null}
          percentChange={summary.mealsRecorded?.percentChange ?? null}
          trendDirection={summary.mealsRecorded?.trendDirection ?? null}
          icon={<Utensils className="w-4 h-4" />}
          iconBgColor="bg-orange-50 dark:bg-orange-950/40"
          iconColor="text-orange-600 dark:text-orange-400"
          emptyStateText="No meals logged in this period"
          recordPromptText="Log meals in Daily Tracking"
          onClickDetail={() => onNavigateTab("tracking")}
        />

        {/* Card 6: Logged Calorie Average */}
        <MetricCard
          id="calorieAverage"
          title="Average Logged Calories"
          value={summary.calorieAverage?.currentValue ?? null}
          unit="kcal/day"
          dateRangeLabel="From meals with nutrition data"
          previousValue={summary.calorieAverage?.previousValue ?? null}
          percentChange={summary.calorieAverage?.percentChange ?? null}
          trendDirection={summary.calorieAverage?.trendDirection ?? null}
          icon={<Flame className="w-4 h-4" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-600 dark:text-amber-400"
          sparklineData={summary.calorieAverage?.sparkline}
          sparklineColor="#F59E0B"
          emptyStateText="Nutritional data not recorded yet"
          recordPromptText="Log food items to calculate calories"
          onClickDetail={() => onNavigateTab("tracking")}
        />

        {/* Card 7: Tracking Completion Percentage */}
        <MetricCard
          id="trackingCompletion"
          title="Tracking Consistency"
          value={summary.trackingCompletion?.currentValue ?? 0}
          unit="%"
          dateRangeLabel={`${trendData?.daysTracked || 0} of ${trendData?.totalDays || 7} days logged`}
          previousValue={summary.trackingCompletion?.previousValue ?? null}
          percentChange={summary.trackingCompletion?.percentChange ?? null}
          trendDirection={summary.trackingCompletion?.trendDirection ?? null}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
          badge="Consistency"
          emptyStateText="0% logging rate"
          onClickDetail={() => onNavigateTab("tracking")}
        />

        {/* Card 8: Medical Documents Stored */}
        <MetricCard
          id="medicalDocuments"
          title="Medical Documents Stored"
          value={summary.medicalDocuments?.totalDocs || 0}
          unit="files"
          dateRangeLabel={`${summary.medicalDocuments?.categoryCount || 0} clinical categories`}
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-teal-50 dark:bg-teal-950/40"
          iconColor="text-[#14B8A6]"
          emptyStateText="No documents uploaded yet"
          recordPromptText="Upload reports in Medical Records"
          onClickDetail={() => onNavigateTab("records")}
        />
      </div>

      {/* 3. Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#1B2D48] pb-1">
        <button
          onClick={() => setActiveChartTab("trends")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeChartTab === "trends"
              ? "bg-[#14B8A6] text-[#0A1628] shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Core Trend Visualizations</span>
        </button>

        <button
          onClick={() => setActiveChartTab("breakdowns")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeChartTab === "breakdowns"
              ? "bg-[#14B8A6] text-[#0A1628] shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <PieIcon className="w-3.5 h-3.5" />
          <span>Category Distributions & Donut Charts</span>
        </button>

        <button
          onClick={() => setActiveChartTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeChartTab === "matrix"
              ? "bg-[#14B8A6] text-[#0A1628] shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Target Progress & Activity Heatmap</span>
        </button>
      </div>

      {/* 4. Chart Views */}
      {activeChartTab === "trends" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Sleep Duration Trajectory */}
          <TrendChart
            title="1. Sleep Duration Trajectory"
            subtitle="Daily logged hours compared against 8.0h baseline"
            data={trendData?.sleepTrend || []}
            series={[
              {
                dataKey: "durationHours",
                name: "Sleep Duration",
                color: "#6366F1",
                strokeWidth: 2.5,
              },
            ]}
            referenceLines={[
              {
                y: 8.0,
                label: "Target (8h)",
                color: "#14B8A6",
              },
            ]}
            yAxisUnit="h"
            yAxisDomain={[4, 12]}
            icon={<Moon className="w-4 h-4 text-indigo-500" />}
            footerNote="Missing nights remain unjoined without false zero substitution."
            emptyStateMessage="No sleep logs recorded in this period."
          />

          {/* Chart 2: Water Intake by Day vs Target */}
          <ComparisonBarChart
            title="2. Daily Water Intake Volume"
            subtitle="Recorded volume in ml with target threshold"
            data={trendData?.waterTrend || []}
            series={[
              {
                dataKey: "amountMl",
                name: "Logged Water",
                color: "#14B8A6",
                radius: [4, 4, 0, 0],
              },
            ]}
            referenceLineY={2500}
            referenceLineLabel="Target 2,500 ml"
            yAxisUnit="ml"
            icon={<Droplets className="w-4 h-4 text-[#14B8A6]" />}
            footerNote="Target line indicates configured daily goal."
            emptyStateMessage="No hydration records logged in this period."
          />

          {/* Chart 3: Physical Activity & Active Minutes */}
          <TrendChart
            title="3. Physical Activity Duration"
            subtitle="Recorded exercise and active minutes"
            data={trendData?.activityTrend || []}
            series={[
              {
                dataKey: "activeMinutes",
                name: "Active Minutes",
                color: "#10B981",
                strokeWidth: 2.5,
              },
            ]}
            referenceLines={[
              {
                y: 45,
                label: "Goal (45m)",
                color: "#10B981",
              },
            ]}
            yAxisUnit="m"
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
            footerNote="Multiple activity logs on the same day are aggregated."
            emptyStateMessage="No physical activities logged in this period."
          />

          {/* Chart 4: Macronutrients Breakdown (Grouped Bar Chart) */}
          <ComparisonBarChart
            title="4. Macronutrients Breakdown"
            subtitle="Daily logged protein, carbohydrates, and fat (grams)"
            data={trendData?.nutritionTrend || []}
            series={[
              { dataKey: "protein", name: "Protein (g)", color: "#3B82F6" },
              { dataKey: "carbs", name: "Carbs (g)", color: "#F59E0B" },
              { dataKey: "fat", name: "Fat (g)", color: "#EF4444" },
            ]}
            yAxisUnit="g"
            icon={<Utensils className="w-4 h-4 text-orange-500" />}
            footerNote="Grounded nutrition values from verified meals."
            emptyStateMessage="No meal macronutrient records available."
          />

          {/* Chart 5: Laboratory Results Trajectory */}
          <div className="lg:col-span-2">
            <LabTrendExplorer
              labTrends={trendData?.labTrends || {}}
              onNavigateToLabs={() => onNavigateTab("labs")}
            />
          </div>
        </div>
      )}

      {activeChartTab === "breakdowns" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart A: Tracking Activity Distribution */}
          <InteractivePieChart
            title="A. Tracking Activity Distribution"
            subtitle="Proportion of total logs recorded across tracking modules"
            disclaimer="Represents the distribution of recorded database entries, not the proportion of hours spent."
            segments={trendData?.trackingDistribution || []}
            unit="logs"
            centerTotalLabel="Total Logs"
            emptyStateMessage="No tracking activities logged yet."
            icon={<CheckCircle2 className="w-4 h-4" />}
          />

          {/* Chart B: Meal Calorie Composition */}
          <InteractivePieChart
            title="B. Macronutrient Calorie Contribution"
            subtitle="Relative caloric contribution (4 kcal/g protein & carbs, 9 kcal/g fat)"
            disclaimer="Calculated using standard Atwater factors (4-4-9 kcal/g). Only displayed when meals have macronutrient values."
            segments={trendData?.mealComposition || []}
            unit="kcal"
            centerTotalLabel="Total Kcal"
            valueKey="calories"
            emptyStateMessage="No meal macronutrients recorded yet."
            icon={<Utensils className="w-4 h-4" />}
          />

          {/* Chart C: Mood Entry Distribution */}
          <InteractivePieChart
            title="C. Mood Reflection Distribution"
            subtitle="Distribution of user-selected mood categories"
            disclaimer="Subjective patient reflection log. Never interpreted as a clinical psychiatric diagnosis."
            segments={trendData?.moodDistribution || []}
            unit="entries"
            centerTotalLabel="Reflections"
            emptyStateMessage="No mood reflections logged yet."
            icon={<Smile className="w-4 h-4" />}
          />

          {/* Chart D: Medical Document Categories */}
          <InteractivePieChart
            title="D. Medical Document Categories"
            subtitle="Distribution of clinical files by document type"
            disclaimer="Extracted directly from verified uploaded medical records."
            segments={trendData?.documentCategories || []}
            unit="files"
            centerTotalLabel="Documents"
            emptyStateMessage="No medical documents uploaded yet."
            icon={<FileText className="w-4 h-4" />}
          />

          {/* Horizontal Bar: Medical Document Inventory */}
          <div className="md:col-span-2">
            <ComparisonBarChart
              title="Medical Records Inventory Breakdown"
              subtitle="Number of stored documents across clinical categories"
              data={trendData?.documentCategories || []}
              series={[
                {
                  dataKey: "count",
                  name: "Files Stored",
                  color: "#14B8A6",
                },
              ]}
              layout="vertical"
              xAxisKey="name"
              yAxisUnit=" files"
              icon={<FileText className="w-4 h-4 text-[#14B8A6]" />}
              footerNote="Verified and indexed in your Healthora repository."
              emptyStateMessage="No documents stored yet."
            />
          </div>
        </div>
      )}

      {activeChartTab === "matrix" && (
        <div className="space-y-6">
          {/* Target Completion Matrix */}
          <HealthProgressChart
            items={targetProgressItems}
            consistencyRate={trendData?.consistencyRate || 0}
            daysTracked={trendData?.daysTracked || 0}
            totalDays={trendData?.totalDays || 7}
          />

          {/* Daily Tracking Completion Stacked Bar Chart */}
          <ComparisonBarChart
            title="Daily Tracking Completion by Category"
            subtitle="Categories logged (sleep, hydration, meals, activity, mood) vs unrecorded"
            data={trendData?.dailyCompletion || []}
            series={[
              {
                dataKey: "completedCount",
                name: "Completed Categories",
                color: "#14B8A6",
                stackId: "comp",
                radius: [0, 0, 0, 0],
              },
              {
                dataKey: "notRecordedCount",
                name: "Not Recorded",
                color: "#E2E8F0",
                stackId: "comp",
                radius: [4, 4, 0, 0],
              },
            ]}
            yAxisUnit=" /5"
            icon={<CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />}
            footerNote="Tracks presence of at least 1 log across each of the 5 wellness dimensions per day."
            emptyStateMessage="No daily tracking data recorded."
          />

          {/* Calendar Activity Heatmap */}
          <CalendarActivityHeatmap
            data={trendData?.activityHeatmap || []}
            title="Daily Logging Activity Density Matrix"
            subtitle="Total logs recorded per day across all tracking categories and journal entries"
          />
        </div>
      )}

      {/* 5. Detailed Data Breakdown Table */}
      <DataBreakdownTable metrics={breakdownRows} />

      {/* 6. Truthful Insights Panel */}
      <InsightsPanel
        insights={trendData?.insights || []}
        onAskCopilot={(context) => {
          if (onLaunchAIBotWithContext) {
            onLaunchAIBotWithContext("analytics", context);
          } else {
            onNavigateTab("ai_bots");
          }
        }}
      />
    </div>
  );
};
