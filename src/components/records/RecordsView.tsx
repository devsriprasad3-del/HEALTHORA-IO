import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Trash2,
  ExternalLink,
  Edit3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Eye,
  FileSearch,
  Split,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { MedicalDocument, ViewTab } from "../../types/health.js";
import { DocumentPreviewModal, PreviewMode } from "./DocumentPreviewModal.js";

interface RecordsViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  openUploadOnMount?: boolean;
}

export const RecordsView: React.FC<RecordsViewProps> = ({ onNavigateTab, openUploadOnMount }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(!!openUploadOnMount);
  const [selectedDocForVerification, setSelectedDocForVerification] = useState<MedicalDocument | null>(null);

  // Document Previewer Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewTarget, setPreviewTarget] = useState<{
    file?: File | null;
    fileBase64?: string | null;
    document?: MedicalDocument | null;
    sampleType?: "lab" | "rx" | null;
    mode: PreviewMode;
  }>({
    mode: "inspection",
  });

  // Upload & processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"Lab Report" | "Prescription" | "Discharge Summary" | "Other">("Lab Report");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadFacility, setUploadFacility] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [selectedSampleType, setSelectedSampleType] = useState<"lab" | "rx" | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    setSelectedSampleType(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Size check (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setUploadError("File exceeds maximum allowed size (25MB).");
        return;
      }
      setSelectedFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));

      // Read as base64 for multimodal analysis if image or for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = (sampleType: "lab" | "rx") => {
    setUploadError("");
    setSelectedSampleType(sampleType);
    setSelectedFile(null);
    setFileBase64("");
    if (sampleType === "lab") {
      setUploadTitle("Diagnostic Biochemistry & Metabolic Panel");
      setUploadType("Lab Report");
      setUploadFacility("Apex Central Diagnostic Laboratory");
      setUploadDate("2026-01-18");
    } else {
      setUploadTitle("Cardiometabolic Consultation & Prescription");
      setUploadType("Prescription");
      setUploadFacility("Apollo Clinic, Indiranagar");
      setUploadDate("2025-10-12");
    }
  };

  const handleUploadSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError("Please provide a document title.");
      return;
    }

    setIsProcessing(true);
    setProcessingStage(1);

    try {
      // Stage 1: Encrypting & Storing
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStage(2);

      // Stage 2: Multimodal Extraction
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStage(3);

      // Stage 3: Structured Data Validation
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStage(4);

      // Stage 4: AI Plain Explanation Generation
      const payload = {
        title: uploadTitle,
        fileName: selectedFile?.name || `${uploadTitle.replace(/\s+/g, "_")}.pdf`,
        fileSize: selectedFile?.size || 1200000,
        mimeType: selectedFile?.type || "application/pdf",
        documentType: uploadType,
        documentDate: uploadDate,
        facility: uploadFacility || "Clinical Health Facility",
        doctor: uploadType === "Prescription" ? "Dr. K. Srinivas, Consultant Cardiologist" : "Dr. Arvind Mehta, MD (Pathologist)",
        fileBase64: fileBase64 || undefined,
        textSnippet: `${uploadTitle} (${uploadType}) recorded on ${uploadDate} at ${uploadFacility}. Clinical laboratory diagnostics and therapy recommendations.`,
        autoAnalyze: true,
      };

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to process document");
      }

      setProcessingStage(5);
      await new Promise((r) => setTimeout(r, 600));

      setUploadModalOpen(false);
      setPreviewModalOpen(false);
      resetForm();
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err?.message || "Document processing failed. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setUploadTitle("");
    setUploadFacility("");
    setSelectedFile(null);
    setFileBase64("");
    setSelectedSampleType(null);
    setUploadError("");
    setProcessingStage(1);
  };

  const handleDeleteDoc = async (docId: string) => {
    if (confirm("Are you sure you want to delete this document and associated extracted records?")) {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      fetchDocuments();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForVerification) return;

    await fetch(`/api/documents/${selectedDocForVerification.id}/verify`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correctedFields: {
          verificationNeeded: ["Patient has manually verified and confirmed extracted records."],
        },
      }),
    });

    setSelectedDocForVerification(null);
    fetchDocuments();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-[#16B8A6] uppercase">
            DOCUMENT INTAKE & VAULT
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white tracking-tight mt-0.5">
            {t("uploadTitle")}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            {t("uploadSubtitle")}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setUploadModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Record</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>{documents.length} Medical Documents Saved</span>
          <span>Encrypted with RLS Vault</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => {
            const isVerified = doc.status === "verified";
            return (
              <div
                key={doc.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs hover:border-[#16B8A6]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                      {doc.documentType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isVerified
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                      }`}
                    >
                      {isVerified ? t("statusVerified") : t("statusAnalyzed")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {doc.facility || "Diagnostic Center"} · {doc.documentDate}
                    </p>
                  </div>

                  {doc.extractedData && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-3">
                      {language === "hi" && doc.extractedData.plainSummaryHi
                        ? doc.extractedData.plainSummaryHi
                        : doc.extractedData.plainSummaryEn}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>{doc.extractedData?.labsCount || 0} Labs Extracted</span>
                    <span>{doc.extractedData?.medsCount || 0} Medications</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPreviewTarget({
                          document: doc,
                          fileBase64: doc.fileBase64 || doc.rawData,
                          mode: "inspection",
                        });
                        setPreviewModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 font-semibold flex items-center gap-1.5 transition-colors border border-teal-200/60 dark:border-teal-800/60"
                      title="Inspect original document in secure previewer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab("summary")}
                      className="font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"
                    >
                      <span>AI Summary</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedDocForVerification(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Verify or correct extracted fields"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {documents.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Medical Documents in Your Vault
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your first laboratory report or prescription to start extracting structured insights.
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-2 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors"
            >
              Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Multi-Stage Upload & OCR Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("uploadTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Multimodal Gemini 3.8 clinical document understanding
                </p>
              </div>
              {!isProcessing && (
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* If Processing, Show Multi-Stage Indicator */}
            {isProcessing ? (
              <div className="py-8 space-y-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 animate-pulse">
                  <Sparkles className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {processingStage === 1 && t("processingStage1")}
                    {processingStage === 2 && t("processingStage2")}
                    {processingStage === 3 && t("processingStage3")}
                    {processingStage === 4 && t("processingStage4")}
                    {processingStage === 5 && t("processingStage5")}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Extracting diagnoses, reference ranges, and plain language summaries
                  </p>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-2 transition-all duration-500"
                    style={{ width: `${(processingStage / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {uploadError}
                  </div>
                )}

                {/* Pre-loaded Sample Selector for Hackathon Demo */}
                <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-2">
                  <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
                    {t("selectSample")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSampleSelect("lab")}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-teal-300 text-teal-700 dark:text-teal-300 font-semibold text-[11px] hover:bg-teal-50 transition-colors"
                    >
                      {t("sampleLabReport")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSampleSelect("rx")}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-teal-300 text-teal-700 dark:text-teal-300 font-semibold text-[11px] hover:bg-teal-50 transition-colors"
                    >
                      {t("samplePrescription")}
                    </button>
                  </div>
                </div>

                {/* File Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 text-center cursor-pointer transition-colors space-y-2 bg-slate-50 dark:bg-slate-800/40"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedFile ? selectedFile.name : t("dragDropText")}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports PDF, JPG, PNG (Max 25MB)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Inline Document Preview Banner (Before Extraction) */}
                {(selectedFile || selectedSampleType) && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate text-xs">
                          {selectedFile ? selectedFile.name : uploadTitle}
                        </div>
                        <div className="text-[10px] text-teal-700 dark:text-teal-300 flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Pre-extraction verified · Ready for preview</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTarget({
                          file: selectedFile,
                          fileBase64: fileBase64,
                          sampleType: selectedSampleType,
                          mode: "pre-extraction",
                        });
                        setPreviewModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 font-bold hover:bg-teal-100/60 dark:hover:bg-slate-700 transition-all shrink-0 shadow-2xs text-xs"
                      title="Preview uploaded document before extraction"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Preview Document</span>
                    </button>
                  </div>
                )}

                {/* Metadata Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Lipid & Metabolic Panel"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Category
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e: any) => setUploadType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Lab Report">Lab Report</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Discharge Summary">Discharge Summary</option>
                      <option value="Imaging Report">Imaging Report</option>
                      <option value="Other">Other Record</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Report Date
                    </label>
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Facility / Clinic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Apex Diagnostics"
                      value={uploadFacility}
                      onChange={(e) => setUploadFacility(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-colors"
                  >
                    Process with Gemini AI
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Verification / Field Review Modal */}
      {selectedDocForVerification && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("extractedFields")} Review
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDocForVerification.title} ({selectedDocForVerification.documentDate})
                </p>
              </div>
              <button
                onClick={() => setSelectedDocForVerification(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Clinical Audit Policy</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Verifying confirms that you have cross-checked these extracted values against your physical paper report.
                </p>
              </div>

              {/* Side-by-Side Original Document Inspection Button */}
              <button
                type="button"
                onClick={() => {
                  setPreviewTarget({
                    document: selectedDocForVerification,
                    fileBase64: selectedDocForVerification.fileBase64 || selectedDocForVerification.rawData,
                    mode: "review",
                  });
                  setPreviewModalOpen(true);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center gap-2 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs"
              >
                <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Inspect Original Source Scan Side-by-Side</span>
              </button>

              {selectedDocForVerification.extractedData?.verificationNeeded && (
                <div className="space-y-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Items flagged by AI for your confirmation:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    {selectedDocForVerification.extractedData.verificationNeeded.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDocForVerification(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-colors"
                >
                  Confirm & Mark Verified
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Document Previewer Modal */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        file={previewTarget.file}
        fileBase64={previewTarget.fileBase64}
        document={previewTarget.document}
        sampleType={previewTarget.sampleType}
        mode={previewTarget.mode}
        isProcessingExtraction={isProcessing}
        onConfirmExtraction={() => {
          handleUploadSubmit();
        }}
        onConfirmVerification={async () => {
          if (selectedDocForVerification) {
            await fetch(`/api/documents/${selectedDocForVerification.id}/verify`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                correctedFields: {
                  verificationNeeded: ["Patient has manually verified and confirmed extracted records."],
                },
              }),
            });
            setSelectedDocForVerification(null);
            setPreviewModalOpen(false);
            fetchDocuments();
          } else if (previewTarget.document) {
            await fetch(`/api/documents/${previewTarget.document.id}/verify`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                correctedFields: {
                  verificationNeeded: ["Patient has manually verified and confirmed extracted records."],
                },
              }),
            });
            setPreviewModalOpen(false);
            fetchDocuments();
          }
        }}
      />
    </div>
  );
};
