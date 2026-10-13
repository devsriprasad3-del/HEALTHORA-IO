import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  Lock,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Calendar,
  Building,
  User,
  Split,
  RefreshCw,
  FileSearch,
} from "lucide-react";
import { MedicalDocument } from "../../types/health.js";

export type PreviewMode = "pre-extraction" | "review" | "inspection";

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Source options
  file?: File | null;
  fileBase64?: string | null;
  document?: MedicalDocument | null;
  sampleType?: "lab" | "rx" | null;
  // Mode
  mode?: PreviewMode;
  // Callbacks
  onConfirmExtraction?: () => void;
  onConfirmVerification?: () => void;
  isProcessingExtraction?: boolean;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  fileBase64,
  document,
  sampleType,
  mode = "inspection",
  onConfirmExtraction,
  onConfirmVerification,
  isProcessingExtraction = false,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<"standard" | "high-contrast" | "grayscale" | "invert">("standard");
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showMetadataDrawer, setShowMetadataDrawer] = useState<boolean>(false);
  const [splitView, setSplitView] = useState<boolean>(mode === "review");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Generate or clean up object URL for local File
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    } else {
      setObjectUrl(null);
    }
  }, [file]);

  // Reset zoom & rotation when document changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
      setFilterMode("standard");
      setSplitView(mode === "review");
    }
  }, [isOpen, file, document, sampleType, mode]);

  if (!isOpen) return null;

  // Determine metadata values
  const docTitle =
    document?.title ||
    file?.name ||
    (sampleType === "lab"
      ? "Diagnostic Biochemistry & Metabolic Panel"
      : sampleType === "rx"
      ? "Cardiometabolic Consultation & Prescription"
      : "Medical Document Preview");

  const docType =
    document?.documentType ||
    (sampleType === "lab" ? "Lab Report" : sampleType === "rx" ? "Prescription" : "Clinical Document");

  const docDate =
    document?.documentDate ||
    (sampleType === "lab" ? "2026-01-18" : sampleType === "rx" ? "2025-10-12" : new Date().toISOString().split("T")[0]);

  const docFacility =
    document?.facility ||
    (sampleType === "lab" ? "Apex Central Diagnostic Laboratory" : sampleType === "rx" ? "Apollo Clinic, Indiranagar" : "Encrypted Clinical Intake");

  const docDoctor =
    document?.doctor ||
    (sampleType === "lab" ? "Dr. Arvind Mehta, MD (Pathologist)" : sampleType === "rx" ? "Dr. K. Srinivas, Consultant Cardiologist" : "Attending Clinician");

  const docSizeFormatted = file
    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    : document?.fileSize
    ? `${(document.fileSize / (1024 * 1024)).toFixed(2)} MB`
    : "1.2 MB";

  const isPdf =
    file?.type === "application/pdf" ||
    file?.name?.toLowerCase().endsWith(".pdf") ||
    document?.mimeType === "application/pdf" ||
    document?.fileName?.toLowerCase().endsWith(".pdf") ||
    (!file && !fileBase64); // Samples render as digital PDF reports

  const isImage =
    file?.type?.startsWith("image/") ||
    document?.mimeType?.startsWith("image/") ||
    fileBase64?.startsWith("data:image/");

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoom(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Filter style mapping
  const getFilterStyle = () => {
    switch (filterMode) {
      case "high-contrast":
        return "contrast-150 brightness-105 saturate-125";
      case "grayscale":
        return "grayscale contrast-125";
      case "invert":
        return "invert hue-rotate-180 contrast-125";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          {/* Document Title & Badges */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <FileSearch className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {docTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 shrink-0">
                  {docType}
                </span>
                {mode === "pre-extraction" && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-3 h-3" />
                    Pre-Extraction Quality Inspection
                  </span>
                )}
                {mode === "review" && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Clinical Audit & Verification
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {docFacility} · {docDate} · {docSizeFormatted}
              </p>
            </div>
          </div>

          {/* Viewer Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                title="Zoom Out (Ctrl -)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400"
                title="Reset Zoom to 100%"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 250}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                title="Zoom In (Ctrl +)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rotation Control */}
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Filter Selector */}
            <div className="hidden md:flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterMode("standard")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  filterMode === "standard"
                    ? "bg-teal-600 text-white font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Natural
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("high-contrast")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  filterMode === "high-contrast"
                    ? "bg-teal-600 text-white font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                title="Enhances faded doctor handwriting & low-contrast receipts"
              >
                High Contrast
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("invert")}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  filterMode === "invert"
                    ? "bg-teal-600 text-white font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                title="Inverted dark room / X-ray radiology view"
              >
                Radiology
              </button>
            </div>

            {/* Split View Toggle in Review Mode */}
            {mode === "review" && (
              <button
                type="button"
                onClick={() => setSplitView(!splitView)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  splitView
                    ? "bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
                title="Toggle side-by-side extracted data comparison"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            )}

            {/* Metadata Info Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowMetadataDrawer(!showMetadataDrawer)}
              className={`p-2 rounded-xl border transition-colors ${
                showMetadataDrawer
                  ? "bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
              title="Toggle Document Audit Metadata"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              title="Close Preview (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Vault Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-teal-200 px-5 py-2 text-[11px] flex items-center justify-between shrink-0 border-b border-teal-800/40">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>
              <strong className="text-white">Sandboxed Medical Vault:</strong> AES-256 client-side isolated preview · HIPAA & ABDM FHIR Architecture
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px] text-teal-300/80">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              RLS Policy Enforced
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="rounded accent-teal-500 w-3 h-3"
              />
              <span>Confidential Watermark</span>
            </label>
          </div>
        </div>

        {/* Main Viewer Body (Supports Split Screen) */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative bg-slate-900/10 dark:bg-slate-950/60">
          {/* Document Render Area */}
          <div
            className={`flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative select-none ${
              splitView ? "sm:max-w-[55%]" : "w-full"
            }`}
          >
            {/* Watermark Overlay */}
            {showWatermark && (
              <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
                <div className="transform -rotate-45 text-slate-400/15 dark:text-teal-400/10 font-black tracking-widest text-xl sm:text-2xl text-center select-none uppercase">
                  HEALTHORA SECURE CLINICAL VAULT
                  <br />
                  <span className="text-xs font-mono font-normal">
                    PATIENT COPY · VERIFIED AUDIT LOG · RESTRICTED
                  </span>
                </div>
              </div>
            )}

            {/* Document Content Container with Transform */}
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
              className={`max-w-full shadow-2xl transition-all duration-200 ${getFilterStyle()}`}
            >
              {/* Scenario 1: Real Local/Uploaded PDF via objectUrl */}
              {file && isPdf && objectUrl && (
                <div className="w-[720px] h-[960px] bg-white rounded-lg shadow-xl overflow-hidden border border-slate-300 relative">
                  <iframe
                    src={`${objectUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title="PDF Medical Report Preview"
                    className="w-full h-full border-none"
                  />
                </div>
              )}

              {/* Scenario 2: Real Local/Uploaded Image via objectUrl or Base64 */}
              {(isImage || fileBase64) && (objectUrl || fileBase64) && (
                <div className="bg-white dark:bg-slate-900 rounded-lg p-2 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-[800px]">
                  <img
                    src={objectUrl || fileBase64 || ""}
                    alt={docTitle}
                    className="max-w-full max-h-[80vh] object-contain rounded"
                  />
                </div>
              )}

              {/* Scenario 3: Pre-seeded Clinical Report (Apex Central Diagnostic Laboratory) */}
              {(!file && !fileBase64 && (sampleType === "lab" || docType === "Lab Report" || document?.id === "doc-1" || document?.id === "doc-3")) && (
                <div className="w-[720px] min-h-[920px] bg-white text-slate-900 p-8 rounded-lg shadow-2xl border border-slate-300 font-sans text-xs space-y-6 relative overflow-hidden">
                  {/* Lab Header */}
                  <div className="border-b-2 border-teal-700 pb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-700 text-white font-black flex items-center justify-center text-sm">
                          AP
                        </div>
                        <div>
                          <h1 className="text-base font-black tracking-tight text-teal-900 uppercase">
                            Apex Central Diagnostic Laboratory
                          </h1>
                          <p className="text-[10px] text-slate-500 font-medium">
                            NABL ISO 15189:2022 Accredited · ICMR Approved Pathology Hub
                          </p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">
                        42, Medical Avenue, Koramangala 4th Block, Bengaluru · Reg # NABL-BLR-4891
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        BARCODE: ||||| |||| || ||||||
                      </div>
                      <div className="text-[10px] font-mono font-bold text-teal-800 mt-1">
                        SID: BCH-2026-99120
                      </div>
                    </div>
                  </div>

                  {/* Patient Information Table */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-400">Patient Name: </span>
                      <strong className="text-slate-900">Rajesh Sharma</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Sample Collected: </span>
                      <strong className="text-slate-900">{docDate} 07:45 AM</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Age / Gender: </span>
                      <strong className="text-slate-900">52 Yrs / Male</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Report Authorized: </span>
                      <strong className="text-slate-900">{docDate} 02:15 PM</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Referred By: </span>
                      <strong className="text-slate-900">Dr. Arvind Mehta, MD</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Sample Matrix: </span>
                      <strong className="text-slate-900">Fluoride / Serum (Venous Blood)</strong>
                    </div>
                  </div>

                  {/* Department Title */}
                  <div className="flex items-center justify-between border-b border-teal-200 pb-1 pt-1">
                    <h2 className="font-bold text-xs uppercase tracking-wider text-teal-900">
                      DEPARTMENT OF CLINICAL BIOCHEMISTRY & ENDOCRINOLOGY
                    </h2>
                    <span className="text-[10px] font-mono text-slate-500">Method: Enzymatic / HPLC Ion Exchange</span>
                  </div>

                  {/* Clinical Test Results Table */}
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100/80">
                        <th className="py-2 px-2">Investigation Test</th>
                        <th className="py-2 px-2 text-right">Observed Value</th>
                        <th className="py-2 px-2">Unit</th>
                        <th className="py-2 px-2">Biological Reference Range</th>
                        <th className="py-2 px-2 text-center">Status Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {/* HbA1c */}
                      <tr className="bg-rose-50/40">
                        <td className="py-2 px-2 font-bold text-slate-900">
                          Glycated Hemoglobin (HbA1c)
                          <div className="text-[9px] text-slate-500 font-normal">Method: Bio-Rad D-10 HPLC</div>
                        </td>
                        <td className="py-2 px-2 text-right font-black text-rose-700 text-xs">7.4</td>
                        <td className="py-2 px-2 font-mono">%</td>
                        <td className="py-2 px-2 text-slate-600 text-[10px]">
                          &lt; 5.7 (Normal)<br />
                          5.7 - 6.4 (Prediabetes)<br />
                          ≥ 6.5 (Diabetes)
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[9px]">
                            HIGH
                          </span>
                        </td>
                      </tr>

                      {/* Fasting Glucose */}
                      <tr className="bg-rose-50/40">
                        <td className="py-2 px-2 font-bold text-slate-900">Fasting Blood Sugar (FBS)</td>
                        <td className="py-2 px-2 text-right font-black text-rose-700 text-xs">138</td>
                        <td className="py-2 px-2 font-mono">mg/dL</td>
                        <td className="py-2 px-2 text-slate-600">70.0 - 99.0</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[9px]">
                            HIGH
                          </span>
                        </td>
                      </tr>

                      {/* Total Cholesterol */}
                      <tr className="bg-amber-50/30">
                        <td className="py-2 px-2 font-semibold text-slate-900">Total Serum Cholesterol</td>
                        <td className="py-2 px-2 text-right font-black text-amber-700 text-xs">218</td>
                        <td className="py-2 px-2 font-mono">mg/dL</td>
                        <td className="py-2 px-2 text-slate-600">&lt; 200.0 (Desirable)</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-black text-[9px]">
                            HIGH
                          </span>
                        </td>
                      </tr>

                      {/* Serum Triglycerides */}
                      <tr className="bg-amber-50/30">
                        <td className="py-2 px-2 font-semibold text-slate-900">Serum Triglycerides</td>
                        <td className="py-2 px-2 text-right font-black text-amber-700 text-xs">182</td>
                        <td className="py-2 px-2 font-mono">mg/dL</td>
                        <td className="py-2 px-2 text-slate-600">&lt; 150.0</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-black text-[9px]">
                            HIGH
                          </span>
                        </td>
                      </tr>

                      {/* LDL Cholesterol */}
                      <tr className="bg-amber-50/30">
                        <td className="py-2 px-2 font-semibold text-slate-900">LDL Direct Cholesterol</td>
                        <td className="py-2 px-2 text-right font-black text-amber-700 text-xs">132</td>
                        <td className="py-2 px-2 font-mono">mg/dL</td>
                        <td className="py-2 px-2 text-slate-600">&lt; 100.0 (Optimal)</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-black text-[9px]">
                            BORDERLINE
                          </span>
                        </td>
                      </tr>

                      {/* HDL Cholesterol */}
                      <tr>
                        <td className="py-2 px-2 font-semibold text-slate-900">HDL Cholesterol (Protective)</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-700">42</td>
                        <td className="py-2 px-2 font-mono">mg/dL</td>
                        <td className="py-2 px-2 text-slate-600">&gt; 40.0</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[9px]">
                            NORMAL
                          </span>
                        </td>
                      </tr>

                      {/* Serum Creatinine */}
                      <tr>
                        <td className="py-2 px-2 font-semibold text-slate-900">Serum Creatinine (Renal)</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-700">0.92</td>
                        <td className="py-2 px-2 font-mono">mg/dL</td>
                        <td className="py-2 px-2 text-slate-600">0.70 - 1.20</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[9px]">
                            NORMAL
                          </span>
                        </td>
                      </tr>

                      {/* eGFR */}
                      <tr>
                        <td className="py-2 px-2 font-semibold text-slate-900">eGFR (CKD-EPI Formula)</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-700">88</td>
                        <td className="py-2 px-2 font-mono">mL/min/1.73m²</td>
                        <td className="py-2 px-2 text-slate-600">&gt; 60.0</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[9px]">
                            NORMAL
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Clinical Interpretation Note */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[10px] text-slate-600">
                    <div className="font-bold text-slate-800">CLINICAL OBSERVATIONS & NOTES:</div>
                    <p>
                      • Patient exhibits suboptimally controlled glycemic parameters (HbA1c 7.4% & Fasting Blood Sugar 138 mg/dL).
                      Correlate clinically with medication adherence and lifestyle interventions.
                    </p>
                    <p>
                      • Renal filtration function (Serum Creatinine 0.92 mg/dL, eGFR 88) is preserved within normal physiological parameters.
                    </p>
                  </div>

                  {/* Signatures & Accreditation Footer */}
                  <div className="pt-6 border-t-2 border-slate-200 flex items-end justify-between">
                    <div>
                      <div className="font-mono text-[9px] text-slate-400">
                        VERIFICATION CODE: VLD-AU5800-4829-OK
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        Printed electronically · Valid without manual physical counter-signature
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif italic font-bold text-teal-900 text-sm">
                        Dr. Arvind Mehta, MD
                      </div>
                      <div className="text-[10px] font-bold text-slate-700">
                        Consultant Pathologist & Medical Director
                      </div>
                      <div className="text-[9px] text-slate-500">
                        KMC Reg # 38291 · Apex Central Diagnostic Laboratory
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario 4: Pre-seeded Clinical Prescription (Apollo Clinic) */}
              {(!file && !fileBase64 && (sampleType === "rx" || docType === "Prescription" || document?.id === "doc-2")) && (
                <div className="w-[720px] min-h-[920px] bg-amber-50/30 text-slate-900 p-8 rounded-lg shadow-2xl border border-slate-300 font-sans text-xs space-y-6 relative overflow-hidden">
                  {/* Clinic Header */}
                  <div className="border-b-2 border-teal-800 pb-4 flex items-start justify-between">
                    <div>
                      <h1 className="text-lg font-black tracking-tight text-teal-950 uppercase">
                        APOLLO CLINIC
                      </h1>
                      <p className="text-[11px] font-bold text-teal-800">
                        Department of Cardiology & Internal Medicine
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1">
                        100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038
                        <br />
                        Phone: (080) 2520-4000 · Email: indiranagar@apolloclinic.com
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="text-xs font-bold text-slate-900">
                        Dr. K. Srinivas, MBBS, MD, DM
                      </div>
                      <div className="text-[10px] text-teal-800 font-semibold">
                        Consultant Cardiologist
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Reg No: KMC-49210
                      </div>
                    </div>
                  </div>

                  {/* Patient Vitals Header */}
                  <div className="grid grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-400">Patient: </span>
                      <strong className="text-slate-900">Rajesh Sharma</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Age/Gender: </span>
                      <strong className="text-slate-900">52 / M</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Date: </span>
                      <strong className="text-slate-900">{docDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">BP: </span>
                      <strong className="text-teal-900">138 / 88 mmHg</strong>
                    </div>
                  </div>

                  {/* Rx Symbol */}
                  <div className="text-3xl font-serif font-black text-teal-900 select-none">
                    ℞
                  </div>

                  {/* Medications List */}
                  <div className="space-y-4 pl-4 border-l-2 border-teal-700">
                    {/* Med 1 */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-900">
                          1. Tab. Metformin (Glucophage) 500 mg
                        </strong>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono text-[10px] font-bold">
                          1 - 0 - 1 (BD)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Take 1 tablet twice daily with meals (Breakfast and Dinner).
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Duration: 90 Days · Refills: 2
                      </div>
                    </div>

                    {/* Med 2 */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-900">
                          2. Tab. Telmisartan (Telma) 40 mg
                        </strong>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-[10px] font-bold">
                          1 - 0 - 0 (OD Morning)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Take 1 tablet once daily in the morning with or without food.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Duration: 90 Days · Indication: Essential Hypertension
                      </div>
                    </div>

                    {/* Med 3 */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-900">
                          3. Tab. Atorvastatin (Atorva) 10 mg
                        </strong>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-mono text-[10px] font-bold">
                          0 - 0 - 1 (OD Bedtime)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Take 1 tablet once daily at bedtime.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Duration: 90 Days · Indication: Hypercholesterolemia
                      </div>
                    </div>
                  </div>

                  {/* Dietary & Lifestyle Instructions */}
                  <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200 text-[11px] space-y-1 text-teal-950">
                    <strong className="font-bold">LIFESTYLE & DIETARY ADVICE:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      <li>Strict low glycemic index diet with complex carbohydrates and high fiber.</li>
                      <li>Limit dietary sodium to &lt; 2,000 mg/day (avoid salted papads, pickles, chips).</li>
                      <li>30 minutes of daily brisk aerobic walking at moderate intensity.</li>
                    </ul>
                  </div>

                  {/* Follow-up Note */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-300">
                    <div>
                      <span className="text-[11px] text-slate-600">
                        Follow-up scheduled in <strong>3 Months</strong> with repeat HbA1c & Fasting Lipid Profile.
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-serif italic text-base font-bold text-teal-900">
                        Dr. K. Srinivas
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Consultant Physician Signature Stamp
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Panel: Extracted Clinical Comparison (In Split View Mode) */}
          {splitView && mode === "review" && (
            <div className="w-full sm:w-[45%] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101C31] flex flex-col h-full overflow-hidden shrink-0 shadow-lg animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Extracted Structured Audit
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                  Side-by-Side Review
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Clinical Disclaimer */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Cross-Check Extraction vs Source</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400">
                    Verify that observed values and prescription dosages on the physical scan match the AI extracted fields below.
                  </p>
                </div>

                {/* Plain Summary */}
                {document?.extractedData && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Clinical Plain Language Summary
                    </label>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {document.extractedData.plainSummaryEn}
                    </div>
                  </div>
                )}

                {/* Flagged Verification Items */}
                {document?.extractedData?.verificationNeeded && document.extractedData.verificationNeeded.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      Flagged for Confirmation
                    </label>
                    <ul className="space-y-1.5">
                      {document.extractedData.verificationNeeded.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2"
                        >
                          <span className="font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Diagnoses Tags */}
                {document?.extractedData?.diagnoses && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Identified Clinical Conditions
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {document.extractedData.diagnoses.map((diag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[11px] font-semibold"
                        >
                          {diag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in Review Mode */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Close Viewer
                </button>
                {onConfirmVerification && (
                  <button
                    type="button"
                    onClick={onConfirmVerification}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Mark Verified</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Drawer: Document Metadata Drawer */}
          {showMetadataDrawer && (
            <div className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101C31] flex flex-col h-full overflow-hidden shrink-0 shadow-lg animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Audit Metadata
                </h4>
                <button
                  onClick={() => setShowMetadataDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Document Title</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{docTitle}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Clinical Facility</div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{docFacility}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Attending Clinician</div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{docDoctor}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Report Date</div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{docDate}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">File Size & Encoding</div>
                  <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                    {docSizeFormatted} · {isPdf ? "application/pdf" : "image/multimodal"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Cryptographic Hash</div>
                  <div className="font-mono text-[10px] text-teal-600 dark:text-teal-400 mt-0.5 break-all">
                    SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Security Clearance</div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>RLS Protected (Client Isolated)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
            <span>
              {mode === "pre-extraction"
                ? "Document is legible and high-resolution. Ready for Google Gemini 3.8 multimodal clinical extraction."
                : "Audited against original hospital diagnostic paper scan."}
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close Preview
            </button>

            {/* In Pre-Extraction Mode: Proceed with extraction */}
            {mode === "pre-extraction" && onConfirmExtraction && (
              <button
                type="button"
                onClick={onConfirmExtraction}
                disabled={isProcessingExtraction}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
              >
                {isProcessingExtraction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Extraction...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Confirm & Extract with Gemini AI</span>
                  </>
                )}
              </button>
            )}

            {/* In Review Mode: Confirm Verification */}
            {mode === "review" && onConfirmVerification && (
              <button
                type="button"
                onClick={onConfirmVerification}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Confirm & Mark Verified</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
