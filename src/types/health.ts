export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  preferredLanguage: "en" | "hi";
  abhaNumber?: string;
  allergies?: string[];
  chronicConditions?: string[];
  avatarUrl?: string;
}

export interface UserSettings {
  waterTargetMl: number;
  sleepTargetHours: number;
  activityTargetMinutes: number;
  timeZone: string;
  aiPreferredLanguage: "en" | "hi";
  aiResponseDetail: "concise" | "balanced" | "detailed";
  enableBrowserNotifications: boolean;
}

export interface ExtractedLabResult {
  id: string;
  documentId: string;
  testName: string;
  category: "Lipid Panel" | "Metabolic / Glucose" | "Hematology" | "Renal / Kidney" | "Thyroid" | "Liver" | "Vitamins" | "Other";
  valueNumeric?: number;
  valueText: string;
  unit: string;
  referenceLow?: number;
  referenceHigh?: number;
  referenceRangeText: string;
  sourceInterpretation: "Within Normal Range" | "Above Reference Range" | "Below Reference Range" | "Requires Review";
  observedDate: string;
  verified: boolean;
  userCorrection?: {
    correctedValue: string;
    correctedBy: string;
    correctedAt: string;
    correctionReason?: string;
  };
  clinicalExplanationEn: string;
  clinicalExplanationHi: string;
  confidenceScore: number;
}

export interface ExtractedClinicalData {
  documentId: string;
  patientName?: string;
  documentType: string;
  documentDate: string;
  facility?: string;
  doctorName?: string;
  diagnoses: string[];
  plainSummaryEn: string;
  plainSummaryHi: string;
  keyObservations: string[];
  verificationNeeded: string[];
  questionsForClinician: string[];
  uncertaintyDisclaimers: string[];
  labsCount: number;
  medsCount: number;
}

export interface MedicalDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: "Lab Report" | "Prescription" | "Discharge Summary" | "Imaging Report" | "Other";
  documentDate: string;
  facility?: string;
  doctor?: string;
  uploadDate: string;
  status: "uploaded" | "processing" | "analyzed" | "verified";
  previewUrl?: string;
  thumbnailUrl?: string;
  fileBase64?: string;
  rawData?: string;
  extractedData?: ExtractedClinicalData;
}

export interface MedicationReminder {
  id: string;
  time: string;
  days: string[];
  enabled: boolean;
  lastAction?: {
    action: "taken" | "skipped" | "snoozed";
    timestamp: string;
  };
}

export interface MedicationItem {
  id: string;
  userId: string;
  documentId?: string;
  name: string;
  genericName?: string;
  strength: string;
  dosage: string;
  route: string;
  frequency: string;
  instructions: string;
  instructionsHi?: string;
  startDate: string;
  endDate?: string;
  status: "Active" | "Extracted" | "Discontinued" | "Completed";
  userConfirmed: boolean;
  prescribingDoctor?: string;
  reminders?: MedicationReminder[];
}

export interface TimelineEvent {
  id: string;
  userId: string;
  date: string;
  type: "document" | "lab" | "medication" | "wellness" | "clinical_note" | "journal";
  title: string;
  summary: string;
  summaryHi?: string;
  documentId?: string;
  meta?: Record<string, any>;
}

export interface WellnessEntry {
  id: string;
  userId: string;
  date: string;
  sleepHours: number;
  steps: number;
  waterGlasses: number;
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  notes?: string;
}

// HEALTHORA 2.0 TRACKING TYPES
export interface SleepEntry {
  id: string;
  userId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationHours: number;
  quality: "poor" | "fair" | "good" | "excellent";
  notes?: string;
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  userId: string;
  date: string;
  amountMl: number;
  unit: "ml" | "l";
  targetMl: number;
  notes?: string;
  createdAt: string;
}

export interface MealEntry {
  id: string;
  userId: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  mealName: string;
  foods: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  isAiEstimated: boolean;
  notes?: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  date: string;
  activityType: string;
  durationMinutes: number;
  steps?: number;
  distanceKm?: number;
  intensity?: "low" | "medium" | "high";
  caloriesBurned?: number;
  notes?: string;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  mood: "great" | "good" | "neutral" | "low" | "stressed" | "anxious";
  notes?: string;
  createdAt: string;
}

export interface DailySummary {
  sleepHours: number | null;
  waterLoggedMl: number;
  waterTargetMl: number;
  waterPercentage: number;
  mealsLogged: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  activityMinutes: number;
  totalSteps: number;
  mood: string | null;
  completionPercentage: number;
}

export interface HealthJournalEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  clinicianQuestions: string[];
  attachedDocumentId?: string;
  attachedDocumentTitle?: string;
  aiSummaryEn?: string;
  aiSummaryHi?: string;
  appointmentPrepList?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AIMessageSource {
  type: "lab" | "document" | "tracking" | "medication" | "journal";
  label: string;
  detail?: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  pageContext?: string;
  sources?: AIMessageSource[];
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  pageContext?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "water" | "sleep" | "activity" | "meal" | "journal" | "appointment" | "medication" | "custom";
  date: string;
  time: string;
  recurrence: "once" | "daily" | "weekly" | "weekdays";
  enabled: boolean;
  completed: boolean;
  snoozedUntil?: string;
  createdAt: string;
}

export type ViewTab =
  | "overview"
  | "tracking"
  | "records"
  | "journal"
  | "ai_bots"
  | "analytics"
  | "reminders"
  | "settings"
  | "labs"
  | "medications"
  | "timeline"
  | "summary"
  | "export"
  | "privacy";
