import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data Directory
const DATA_DIR = path.resolve(__dirname, "../.data");
const DB_FILE = path.join(DATA_DIR, "healthora_db.json");

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
  rawData?: string; // base64 or document marker
  extractedData?: ExtractedClinicalData;
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

// HEALTHORA 2.0 TRACKING ENTITIES
export interface SleepEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // HH:mm
  wakeTime: string; // HH:mm
  durationHours: number;
  quality: "poor" | "fair" | "good" | "excellent";
  notes?: string;
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  unit: "ml" | "l";
  targetMl: number;
  time?: string;
  notes?: string;
  createdAt: string;
}

export interface MealEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  mealName: string;
  foods: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  isAiEstimated: boolean; // Explicitly distinguishes user-entered vs AI-estimated!
  notes?: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  activityType: string; // "Brisk Walking", "Cycling", "Morning Yoga", "Strength Training", etc.
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
  date: string; // YYYY-MM-DD
  mood: "great" | "good" | "neutral" | "low" | "stressed" | "anxious";
  notes?: string;
  createdAt: string;
}

export interface HealthJournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string; // user's own symptoms/experience
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
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  recurrence: "once" | "daily" | "weekly" | "weekdays";
  enabled: boolean;
  completed: boolean;
  snoozedUntil?: string;
  createdAt: string;
}

export interface ProfileState {
  profile: UserProfile;
  settings: UserSettings;
  documents: MedicalDocument[];
  labs: ExtractedLabResult[];
  medications: MedicationItem[];
  timeline: TimelineEvent[];
  wellness: WellnessEntry[];
  sleepEntries: SleepEntry[];
  waterEntries: WaterEntry[];
  mealEntries: MealEntry[];
  activityEntries: ActivityEntry[];
  moodEntries: MoodEntry[];
  journalEntries: HealthJournalEntry[];
  conversations: AIConversation[];
  messages: AIMessage[];
  reminders: ReminderItem[];
}

// Initial demo seed data
export const DEMO_PROFILES: Record<string, ProfileState> = {
  rajesh: {
    profile: {
      id: "demo-rajesh",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@example.com",
      dob: "1978-04-14",
      gender: "Male",
      bloodGroup: "B+",
      preferredLanguage: "en",
      abhaNumber: "91-4821-9032-4112",
      allergies: ["Penicillin", "Sulfa drugs"],
      chronicConditions: ["Type 2 Diabetes Mellitus", "Dyslipidemia", "Essential Hypertension"],
      avatarUrl: "/src/assets/images/avatar_patient_demo_1791789273596.jpg",
    },
    settings: {
      waterTargetMl: 2500,
      sleepTargetHours: 8.0,
      activityTargetMinutes: 45,
      timeZone: "Asia/Kolkata",
      aiPreferredLanguage: "en",
      aiResponseDetail: "balanced",
      enableBrowserNotifications: false,
    },
    documents: [
      {
        id: "doc-1",
        userId: "demo-rajesh",
        title: "Comprehensive Metabolic & Lipid Profile",
        fileName: "Apex_Pathology_Lipid_Metabolic_Jan2026.pdf",
        fileSize: 1420000,
        mimeType: "application/pdf",
        documentType: "Lab Report",
        documentDate: "2026-01-18",
        facility: "Apex Diagnostic & Specialty Pathology",
        doctor: "Dr. Arvind Kulkarni, MD (Path)",
        uploadDate: "2026-01-18T10:30:00Z",
        status: "verified",
        previewUrl: "/src/assets/images/doc_lab_report_sample_1791789285403.jpg",
        extractedData: {
          documentId: "doc-1",
          patientName: "Rajesh Sharma",
          documentType: "Pathology Diagnostic Panel",
          documentDate: "2026-01-18",
          facility: "Apex Diagnostics",
          doctorName: "Dr. Arvind Kulkarni",
          diagnoses: ["Type 2 Diabetes Mellitus", "Dyslipidemia"],
          plainSummaryEn:
            "Your blood sugar levels (HbA1c at 7.4% and Fasting Blood Glucose at 138 mg/dL) remain above standard non-diabetic ranges, reflecting steady chronic hyperglycemia. Your total cholesterol is slightly high at 218 mg/dL, though kidney creatinine is stable.",
          plainSummaryHi:
            "आपके रक्त शर्करा (HbA1c 7.4% और फास्टिंग ग्लूकोज 138 mg/dL) सामान्य सीमा से अधिक हैं, जो लगातार मधुमेह का संकेत देते हैं। कोलेस्ट्रॉल 218 mg/dL पर थोड़ा बढ़ा हुआ है, लेकिन किडनी की कार्यक्षमता (क्रिएटिनिन) सामान्य है।",
          keyObservations: [
            "Glycated Hemoglobin (HbA1c) 7.4% reflects average blood glucose around 165 mg/dL over past 90 days.",
            "Fasting blood sugar 138 mg/dL is improved compared to October (148 mg/dL).",
            "Total Cholesterol 218 mg/dL shows a modest decrease from May (242 mg/dL).",
            "Serum Creatinine 0.95 mg/dL is completely normal, indicating intact renal clearance.",
          ],
          verificationNeeded: [
            "Confirm exact fasting interval (was it 10-12 hours before specimen collection)?",
            "Verify whether evening metformin dose was taken before morning blood draw.",
          ],
          questionsForClinician: [
            "Is the gradual HbA1c reduction from 7.8% to 7.4% on track for our 6-month goal?",
            "Should we adjust the dosage of Metformin or Atorvastatin based on this lipid panel?",
            "What lifestyle adjustments can accelerate fasting glucose normalization?",
          ],
          uncertaintyDisclaimers: [
            "This structured summary is an AI-assisted translation of your laboratory report. It does not constitute medical diagnosis or prescribe clinical treatment.",
          ],
          labsCount: 5,
          medsCount: 0,
        },
      },
      {
        id: "doc-2",
        userId: "demo-rajesh",
        title: "Cardiometabolic Prescription & Regimen",
        fileName: "Apollo_Clinic_Prescription_Jan2026.pdf",
        fileSize: 890000,
        mimeType: "application/pdf",
        documentType: "Prescription",
        documentDate: "2026-01-20",
        facility: "Apollo Specialty Clinic",
        doctor: "Dr. Neha Verma, MD (Endocrinology)",
        uploadDate: "2026-01-20T14:15:00Z",
        status: "verified",
        extractedData: {
          documentId: "doc-2",
          patientName: "Rajesh Sharma",
          documentType: "Outpatient Clinical Prescription",
          documentDate: "2026-01-20",
          facility: "Apollo Clinic",
          doctorName: "Dr. Neha Verma",
          diagnoses: ["Type 2 Diabetes Mellitus", "Dyslipidemia", "Hypertension"],
          plainSummaryEn:
            "Prescription renewing Metformin 500mg twice daily with meals, Atorvastatin 20mg at bedtime, and Telmisartan 40mg each morning.",
          plainSummaryHi:
            "भोजन के साथ दिन में दो बार मेटफॉर्मिन 500 मिलीग्राम, रात को एटोरवास्टेटिन 20 मिलीग्राम और सुबह टेलमिसर्टन 40 मिलीग्राम की खुराक जारी रखने का नुस्खा।",
          keyObservations: [
            "Continued Metformin 500mg BID for glycemic regulation.",
            "Lipid therapy continued with Atorvastatin 20mg bedtime.",
            "Blood pressure support with Telmisartan 40mg OD.",
          ],
          verificationNeeded: ["Confirm pharmacy refilled the exact brand and strength."],
          questionsForClinician: ["Can we review kidney markers again in 6 months?"],
          uncertaintyDisclaimers: ["Always verify medication instructions with your pharmacist."],
          labsCount: 0,
          medsCount: 3,
        },
      },
    ],
    labs: [
      {
        id: "lab-hba1c-1",
        documentId: "doc-1",
        testName: "Hemoglobin A1c (HbA1c)",
        category: "Metabolic / Glucose",
        valueNumeric: 7.4,
        valueText: "7.4",
        unit: "%",
        referenceLow: 4.0,
        referenceHigh: 5.6,
        referenceRangeText: "4.0 - 5.6 % (Non-diabetic)",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Indicates 3-month average glucose control. 7.4% is in the established diabetes management range.",
        clinicalExplanationHi: "पिछले 3 महीनों का औसत ब्लड शुगर दर्शाता है। 7.4% प्रबंधित मधुमेह की श्रेणी में आता है।",
        confidenceScore: 0.99,
      },
      {
        id: "lab-fbs-1",
        documentId: "doc-1",
        testName: "Fasting Blood Sugar (FBS)",
        category: "Metabolic / Glucose",
        valueNumeric: 138,
        valueText: "138",
        unit: "mg/dL",
        referenceLow: 70,
        referenceHigh: 99,
        referenceRangeText: "70 - 99 mg/dL",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Morning blood sugar after 10-12 hours fasting. Normal is under 100 mg/dL.",
        clinicalExplanationHi: "सुबह खाली पेट का ब्लड शुगर। सामान्य सीमा 100 mg/dL से कम होती है।",
        confidenceScore: 0.98,
      },
      {
        id: "lab-chol-1",
        documentId: "doc-1",
        testName: "Total Cholesterol",
        category: "Lipid Panel",
        valueNumeric: 218,
        valueText: "218",
        unit: "mg/dL",
        referenceLow: 125,
        referenceHigh: 200,
        referenceRangeText: "< 200 mg/dL Desirable",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Overall circulating cholesterol in bloodstream. Target is below 200 mg/dL.",
        clinicalExplanationHi: "रक्त में कुल कोलेस्ट्रॉल। वांछनीय स्तर 200 mg/dL से नीचे होता है।",
        confidenceScore: 0.97,
      },
      {
        id: "lab-creat-1",
        documentId: "doc-1",
        testName: "Serum Creatinine",
        category: "Renal / Kidney",
        valueNumeric: 0.95,
        valueText: "0.95",
        unit: "mg/dL",
        referenceLow: 0.7,
        referenceHigh: 1.3,
        referenceRangeText: "0.70 - 1.30 mg/dL",
        sourceInterpretation: "Within Normal Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Waste product filtered by kidneys. 0.95 mg/dL confirms healthy kidney filtration.",
        clinicalExplanationHi: "गुर्दे द्वारा फिल्टर किया जाने वाला अपशिष्ट उत्पाद। 0.95 mg/dL स्वस्थ कार्यप्रणाली दर्शाता है।",
        confidenceScore: 0.99,
      },
    ],
    medications: [
      {
        id: "med-1",
        userId: "demo-rajesh",
        documentId: "doc-2",
        name: "Metformin Hydrochloride",
        genericName: "Metformin",
        strength: "500 mg",
        dosage: "1 tablet with meals",
        route: "Oral",
        frequency: "Twice daily (Breakfast & Dinner)",
        instructions: "Take immediately with or after food to prevent gastrointestinal upset.",
        instructionsHi: "पेट की परेशानी से बचने के लिए भोजन के साथ या तुरंत बाद लें।",
        startDate: "2025-05-10",
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: "Dr. Neha Verma",
        reminders: [
          { id: "rem-med-1", time: "08:30", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true },
          { id: "rem-med-2", time: "20:30", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true },
        ],
      },
      {
        id: "med-2",
        userId: "demo-rajesh",
        documentId: "doc-2",
        name: "Atorvastatin",
        genericName: "Atorvastatin Calcium",
        strength: "20 mg",
        dosage: "1 tablet at bedtime",
        route: "Oral",
        frequency: "Once daily at night",
        instructions: "Take once daily in the evening or bedtime with water.",
        instructionsHi: "रोजाना रात को पानी के साथ लें।",
        startDate: "2025-05-10",
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: "Dr. Neha Verma",
        reminders: [
          { id: "rem-med-3", time: "22:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true },
        ],
      },
      {
        id: "med-3",
        userId: "demo-rajesh",
        documentId: "doc-2",
        name: "Telmisartan",
        genericName: "Telmisartan",
        strength: "40 mg",
        dosage: "1 tablet in the morning",
        route: "Oral",
        frequency: "Once daily in the morning",
        instructions: "Take in the morning with or without food for blood pressure maintenance.",
        instructionsHi: "रक्तचाप नियंत्रण के लिए सुबह लें।",
        startDate: "2025-08-15",
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: "Dr. Neha Verma",
        reminders: [
          { id: "rem-med-4", time: "08:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true },
        ],
      },
    ],
    timeline: [
      {
        id: "time-1",
        userId: "demo-rajesh",
        date: "2026-01-20",
        type: "medication",
        title: "Cardiometabolic Prescription Confirmed",
        summary: "Prescription from Apollo Clinic for Metformin, Atorvastatin, and Telmisartan.",
        summaryHi: "अपोलो क्लिनिक से मेटफॉर्मिन, एटोरवास्टेटिन और टेलमिसर्टन का नुस्खा सत्यापित किया गया।",
        documentId: "doc-2",
      },
      {
        id: "time-2",
        userId: "demo-rajesh",
        date: "2026-01-18",
        type: "lab",
        title: "Metabolic & Lipid Panel Analyzed",
        summary: "HbA1c measured at 7.4% (down from 7.5% in Oct 2025). Fasting blood sugar at 138 mg/dL.",
        summaryHi: "HbA1c 7.4% मापा गया (अक्टूबर 2025 में 7.5% से कम)। फास्टिंग ग्लूकोज 138 mg/dL।",
        documentId: "doc-1",
      },
    ],
    wellness: [
      {
        id: "wel-1",
        userId: "demo-rajesh",
        date: "2026-10-11",
        sleepHours: 7.5,
        steps: 6420,
        waterGlasses: 8.5,
        restingHeartRate: 72,
        bloodPressureSystolic: 126,
        bloodPressureDiastolic: 82,
        notes: "Morning 35-min brisk walk. Felt energetic throughout workday.",
      },
      {
        id: "wel-2",
        userId: "demo-rajesh",
        date: "2026-10-12",
        sleepHours: 7.2,
        steps: 4890,
        waterGlasses: 7.0,
        restingHeartRate: 74,
        bloodPressureSystolic: 128,
        bloodPressureDiastolic: 84,
        notes: "Completed breakfast metformin on time.",
      },
    ],
    // SLEEP ENTRIES (Calculated durations, overnight interval handling)
    sleepEntries: [
      {
        id: "sleep-1",
        userId: "demo-rajesh",
        date: "2026-10-06",
        bedtime: "23:15",
        wakeTime: "06:45",
        durationHours: 7.5,
        quality: "good",
        notes: "Fell asleep quickly after evening reading.",
        createdAt: "2026-10-07T07:00:00Z",
      },
      {
        id: "sleep-2",
        userId: "demo-rajesh",
        date: "2026-10-07",
        bedtime: "23:30",
        wakeTime: "06:30",
        durationHours: 7.0,
        quality: "good",
        notes: "Woke up once around 3 AM for water, fell back asleep.",
        createdAt: "2026-10-08T07:00:00Z",
      },
      {
        id: "sleep-3",
        userId: "demo-rajesh",
        date: "2026-10-08",
        bedtime: "00:00",
        wakeTime: "06:30",
        durationHours: 6.5,
        quality: "fair",
        notes: "Late work call, slight morning fatigue.",
        createdAt: "2026-10-09T07:00:00Z",
      },
      {
        id: "sleep-4",
        userId: "demo-rajesh",
        date: "2026-10-09",
        bedtime: "23:00",
        wakeTime: "07:00",
        durationHours: 8.0,
        quality: "excellent",
        notes: "Deep restorative sleep.",
        createdAt: "2026-10-10T07:30:00Z",
      },
      {
        id: "sleep-5",
        userId: "demo-rajesh",
        date: "2026-10-10",
        bedtime: "23:30",
        wakeTime: "07:15",
        durationHours: 7.75,
        quality: "good",
        notes: "Weekend rest.",
        createdAt: "2026-10-11T07:30:00Z",
      },
      {
        id: "sleep-6",
        userId: "demo-rajesh",
        date: "2026-10-11",
        bedtime: "23:00",
        wakeTime: "06:30",
        durationHours: 7.5,
        quality: "good",
        notes: "Slept smoothly with room temperature set to 23C.",
        createdAt: "2026-10-12T06:45:00Z",
      },
      {
        id: "sleep-7",
        userId: "demo-rajesh",
        date: "2026-10-12",
        bedtime: "23:15",
        wakeTime: "06:30",
        durationHours: 7.25,
        quality: "good",
        notes: "Woke up refreshed ahead of morning routine.",
        createdAt: "2026-10-12T07:00:00Z",
      },
    ],
    // WATER ENTRIES (Logged in ml with personal target 2500 ml)
    waterEntries: [
      {
        id: "water-1",
        userId: "demo-rajesh",
        date: "2026-10-08",
        amountMl: 2200,
        unit: "ml",
        targetMl: 2500,
        notes: "Hydrated steadily throughout clinic workday.",
        createdAt: "2026-10-08T21:00:00Z",
      },
      {
        id: "water-2",
        userId: "demo-rajesh",
        date: "2026-10-09",
        amountMl: 2600,
        unit: "ml",
        targetMl: 2500,
        notes: "Reached 104% of daily goal.",
        createdAt: "2026-10-09T21:30:00Z",
      },
      {
        id: "water-3",
        userId: "demo-rajesh",
        date: "2026-10-10",
        amountMl: 2400,
        unit: "ml",
        targetMl: 2500,
        notes: "Post-workout hydration.",
        createdAt: "2026-10-10T20:30:00Z",
      },
      {
        id: "water-4",
        userId: "demo-rajesh",
        date: "2026-10-11",
        amountMl: 2500,
        unit: "ml",
        targetMl: 2500,
        notes: "Target achieved precisely.",
        createdAt: "2026-10-11T21:00:00Z",
      },
      {
        id: "water-5",
        userId: "demo-rajesh",
        date: "2026-10-12",
        amountMl: 1750,
        unit: "ml",
        targetMl: 2500,
        notes: "Morning 500ml + midday 750ml + afternoon 500ml logged so far.",
        createdAt: "2026-10-12T15:30:00Z",
      },
    ],
    // MEAL ENTRIES (Clearly distinguishing user-entered vs AI-estimated nutrition)
    mealEntries: [
      {
        id: "meal-1",
        userId: "demo-rajesh",
        date: "2026-10-11",
        mealType: "breakfast",
        mealName: "Vegetable Oats Upma & Boiled Egg",
        foods: "Oats with mixed carrots, beans, peas (1 bowl), 1 hard-boiled egg, 1 cup unsweetened black tea.",
        calories: 320,
        proteinG: 14,
        carbsG: 42,
        fatG: 9,
        isAiEstimated: false,
        notes: "Took morning Metformin 500mg immediately after meal.",
        createdAt: "2026-10-11T09:00:00Z",
      },
      {
        id: "meal-2",
        userId: "demo-rajesh",
        date: "2026-10-11",
        mealType: "lunch",
        mealName: "Roti, Moong Dal & Palak Paneer",
        foods: "2 whole wheat multigrain phulkas, 1 cup yellow moong dal, 1 cup palak paneer, cucumber salad.",
        calories: 520,
        proteinG: 22,
        carbsG: 64,
        fatG: 16,
        isAiEstimated: false,
        notes: "High fiber salad eaten before carbs.",
        createdAt: "2026-10-11T13:30:00Z",
      },
      {
        id: "meal-3",
        userId: "demo-rajesh",
        date: "2026-10-11",
        mealType: "dinner",
        mealName: "Grilled Fish & Steamed Greens",
        foods: "150g grilled pomfret with lemon herb dressing, steamed broccoli and zucchini.",
        calories: 380,
        proteinG: 34,
        carbsG: 12,
        fatG: 14,
        isAiEstimated: true, // Marked as AI-estimated
        notes: "AI nutrition estimate based on standard food database portion sizes.",
        createdAt: "2026-10-11T20:30:00Z",
      },
      {
        id: "meal-4",
        userId: "demo-rajesh",
        date: "2026-10-12",
        mealType: "breakfast",
        mealName: "Besan Chilla with Mint Chutney",
        foods: "2 savory chickpea flour crepes filled with grated paneer and spinach, unsweetened chai.",
        calories: 340,
        proteinG: 16,
        carbsG: 38,
        fatG: 12,
        isAiEstimated: false,
        notes: "Fasting blood sugar 128 mg/dL recorded before breakfast.",
        createdAt: "2026-10-12T09:15:00Z",
      },
      {
        id: "meal-5",
        userId: "demo-rajesh",
        date: "2026-10-12",
        mealType: "lunch",
        mealName: "Brown Rice, Rajma & Kachumber",
        foods: "1 cup steamed brown rice, 1.5 cups rajma (kidney bean curry), chopped tomato-cucumber salad.",
        calories: 490,
        proteinG: 19,
        carbsG: 78,
        fatG: 8,
        isAiEstimated: true,
        notes: "AI estimated macro breakdown.",
        createdAt: "2026-10-12T13:45:00Z",
      },
    ],
    // ACTIVITY ENTRIES (Actual recorded workouts)
    activityEntries: [
      {
        id: "act-1",
        userId: "demo-rajesh",
        date: "2026-10-09",
        activityType: "Brisk Walking",
        durationMinutes: 40,
        steps: 4200,
        distanceKm: 3.1,
        intensity: "medium",
        caloriesBurned: 195,
        notes: "Lakeside park walk before work.",
        createdAt: "2026-10-09T08:00:00Z",
      },
      {
        id: "act-2",
        userId: "demo-rajesh",
        date: "2026-10-10",
        activityType: "Stationary Cycling",
        durationMinutes: 30,
        steps: 1200,
        distanceKm: 9.4,
        intensity: "medium",
        caloriesBurned: 220,
        notes: "Indoor cardio session.",
        createdAt: "2026-10-10T18:00:00Z",
      },
      {
        id: "act-3",
        userId: "demo-rajesh",
        date: "2026-10-11",
        activityType: "Brisk Walking & Light Stretches",
        durationMinutes: 45,
        steps: 5100,
        distanceKm: 3.8,
        intensity: "medium",
        caloriesBurned: 240,
        notes: "Paced pace, heart rate maintained around 110-118 bpm.",
        createdAt: "2026-10-11T08:00:00Z",
      },
      {
        id: "act-4",
        userId: "demo-rajesh",
        date: "2026-10-12",
        activityType: "Morning Power Walk",
        durationMinutes: 35,
        steps: 3950,
        distanceKm: 2.9,
        intensity: "medium",
        caloriesBurned: 180,
        notes: "Completed before morning tea.",
        createdAt: "2026-10-12T07:45:00Z",
      },
    ],
    // MOOD ENTRIES (Private subjective wellbeing log)
    moodEntries: [
      {
        id: "mood-1",
        userId: "demo-rajesh",
        date: "2026-10-09",
        mood: "good",
        notes: "Calm and steady. Fasting glucose numbers looking better this week.",
        createdAt: "2026-10-09T21:00:00Z",
      },
      {
        id: "mood-2",
        userId: "demo-rajesh",
        date: "2026-10-10",
        mood: "great",
        notes: "Enjoyed long weekend morning with family. Energy levels solid.",
        createdAt: "2026-10-10T21:00:00Z",
      },
      {
        id: "mood-3",
        userId: "demo-rajesh",
        date: "2026-10-11",
        mood: "good",
        notes: "Satisfied with sticking to diet plan without craving sweets.",
        createdAt: "2026-10-11T21:30:00Z",
      },
      {
        id: "mood-4",
        userId: "demo-rajesh",
        date: "2026-10-12",
        mood: "good",
        notes: "Focused and alert. Ready for mid-week clinic follow-up preparation.",
        createdAt: "2026-10-12T10:00:00Z",
      },
    ],
    // HEALTH JOURNAL ENTRIES
    journalEntries: [
      {
        id: "jour-1",
        userId: "demo-rajesh",
        date: "2026-10-10",
        title: "Occasional Late Afternoon Dizziness After Fast Walking",
        content:
          "Noticed mild lightheadedness around 4:30 PM after doing a brisk 40-minute walk before lunch. Had only half a cup of buttermilk. Checked blood sugar immediately with glucometer: 104 mg/dL. Drank water and rested 10 minutes, feeling resolved quickly.",
        tags: ["Dizziness", "Blood Sugar", "Walking", "Exercise"],
        clinicianQuestions: [
          "Was the 4:30 PM dizziness related to mild hypoglycemia or mild dehydration?",
          "Should I shift my brisk walking closer to breakfast or have a pre-walk snack?",
        ],
        attachedDocumentId: "doc-1",
        attachedDocumentTitle: "Comprehensive Metabolic & Lipid Profile",
        aiSummaryEn:
          "User recorded transient afternoon lightheadedness following fasted brisk walking. Glucometer reading was 104 mg/dL (within normal glucose range). Symptoms rapidly resolved with rest and hydration.",
        aiSummaryHi:
          "उपयोगकर्ता ने खाली पेट तेज चलने के बाद दोपहर में हल्के चक्कर आने की बात दर्ज की। ग्लूकोमीटर की रीडिंग 104 mg/dL थी। आराम और पानी पीने के बाद लक्षण तुरंत ठीक हो गए।",
        appointmentPrepList: [
          "Report 104 mg/dL reading during dizziness episode.",
          "Discuss optimal timing between Metformin intake, meals, and physical exercise.",
        ],
        createdAt: "2026-10-10T17:15:00Z",
        updatedAt: "2026-10-10T17:20:00Z",
      },
      {
        id: "jour-2",
        userId: "demo-rajesh",
        date: "2026-10-12",
        title: "Questions Prepared for Dr. Verma's Quarterly Review",
        content:
          "Reviewing recent 3-month labs: HbA1c is down to 7.4% from 7.8% last year, and total cholesterol is 218 mg/dL. Fasting blood sugar has averaged around 132-138 mg/dL. Want to confirm if my current dosage of Metformin 500mg BID and Atorvastatin 20mg should stay unchanged.",
        tags: ["Endocrinology", "Quarterly Review", "Metformin", "HbA1c Target"],
        clinicianQuestions: [
          "Is an HbA1c of 7.4% acceptable for my current age and cardiac risk profile, or should we aim for under 7.0%?",
          "Can we repeat the lipid panel in 3 months to monitor response to Atorvastatin?",
          "Should I take any specific vitamin B12 supplement given long-term Metformin usage?",
        ],
        attachedDocumentId: "doc-2",
        attachedDocumentTitle: "Cardiometabolic Prescription & Regimen",
        aiSummaryEn:
          "Patient is organizing findings for Dr. Verma: noted improvement in 3-month HbA1c to 7.4% and prepared 3 focused questions on glycemic targets, lipid monitoring, and vitamin B12 status on Metformin.",
        aiSummaryHi:
          "मरीज डॉ. वर्मा के साथ परामर्श के लिए तैयार कर रहे हैं: HbA1c में 7.4% तक सुधार नोट किया गया है और दवाओं की समीक्षा व विटामिन B12 पर 3 प्रश्न तैयार किए गए हैं।",
        appointmentPrepList: [
          "Show 30-day home glucometer log (average FBS 134 mg/dL).",
          "Ask about Vitamin B12 monitoring with long-term Metformin.",
          "Request lipid retest schedule.",
        ],
        createdAt: "2026-10-12T08:30:00Z",
        updatedAt: "2026-10-12T08:30:00Z",
      },
    ],
    // AI BOTS CONVERSATIONS & MESSAGES
    conversations: [
      {
        id: "conv-1",
        userId: "demo-rajesh",
        title: "Weekly Wellness & Lab Correlation",
        pageContext: "overview",
        createdAt: "2026-10-11T11:00:00Z",
        updatedAt: "2026-10-11T11:05:00Z",
      },
    ],
    messages: [
      {
        id: "msg-1",
        conversationId: "conv-1",
        role: "user",
        content: "Summarize my sleep and activity records over the past week and how they relate to my diabetes goals.",
        timestamp: "2026-10-11T11:00:00Z",
        pageContext: "overview",
      },
      {
        id: "msg-2",
        conversationId: "conv-1",
        role: "model",
        content:
          "Based on your authenticated records:\n\n1. **Sleep Consistency:** You logged sleep on 7 consecutive days, averaging **7.36 hours per night** (ranging from 6.5 to 8.0 hours). Quality was rated Good on 5 nights and Excellent on 1 night.\n2. **Physical Activity:** You completed 4 recorded workouts totaling **150 active minutes** of brisk walking and cycling, exceeding the standard weekly 150-minute moderate aerobic threshold.\n3. **Clinical Context:** Regular physical activity and consistent 7+ hours of sleep directly support insulin sensitivity. Your latest laboratory HbA1c was recorded at **7.4%** (down from 7.8%), reflecting progressive management.\n\n*Note: This information summarizes your recorded daily tracking and laboratory values for educational clarity. Continue following Dr. Verma's individualized regimen.*",
        timestamp: "2026-10-11T11:00:30Z",
        pageContext: "overview",
        sources: [
          { type: "tracking", label: "7 Sleep Entries (Oct 6-12)", detail: "Avg 7.36 hrs" },
          { type: "tracking", label: "4 Activity Entries", detail: "150 active mins" },
          { type: "lab", label: "HbA1c Lab Result (Jan 2026)", detail: "7.4%" },
        ],
      },
    ],
    // REMINDERS & NOTIFICATIONS
    reminders: [
      {
        id: "rem-1",
        userId: "demo-rajesh",
        title: "Morning Metformin & Telmisartan",
        description: "Take Metformin 500mg with breakfast and Telmisartan 40mg with water.",
        category: "medication",
        date: "2026-10-12",
        time: "08:30",
        recurrence: "daily",
        enabled: true,
        completed: true,
        createdAt: "2026-10-01T00:00:00Z",
      },
      {
        id: "rem-2",
        userId: "demo-rajesh",
        title: "Afternoon Hydration Check",
        description: "Ensure you have logged at least 1500 ml of water by 2 PM.",
        category: "water",
        date: "2026-10-12",
        time: "14:00",
        recurrence: "daily",
        enabled: true,
        completed: true,
        createdAt: "2026-10-01T00:00:00Z",
      },
      {
        id: "rem-3",
        userId: "demo-rajesh",
        title: "Evening 30-Minute Brisk Walk",
        description: "Target 3500+ steps before dinner in the community park.",
        category: "activity",
        date: "2026-10-12",
        time: "18:00",
        recurrence: "daily",
        enabled: true,
        completed: false,
        createdAt: "2026-10-01T00:00:00Z",
      },
      {
        id: "rem-4",
        userId: "demo-rajesh",
        title: "Evening Metformin & Bedtime Atorvastatin",
        description: "Take Metformin 500mg with dinner and Atorvastatin 20mg at 10 PM.",
        category: "medication",
        date: "2026-10-12",
        time: "20:30",
        recurrence: "daily",
        enabled: true,
        completed: false,
        createdAt: "2026-10-01T00:00:00Z",
      },
      {
        id: "rem-5",
        userId: "demo-rajesh",
        title: "Endocrinologist Appointment — Dr. Neha Verma",
        description: "Quarterly diabetes & lipid review at Apollo Specialty Clinic (Room 302). Bring recent lab summary dossier.",
        category: "appointment",
        date: "2026-10-16",
        time: "10:30",
        recurrence: "once",
        enabled: true,
        completed: false,
        createdAt: "2026-10-05T00:00:00Z",
      },
    ],
  },
  priya: {
    profile: {
      id: "demo-priya",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      dob: "1991-09-22",
      gender: "Female",
      bloodGroup: "O+",
      preferredLanguage: "en",
      abhaNumber: "91-3142-8761-9045",
      allergies: ["Aspirin"],
      chronicConditions: ["Mild Thyroiditis (Subclinical)", "Iron Deficiency Anemia (Resolved)"],
      avatarUrl: "/src/assets/images/avatar_patient_demo_1791789273596.jpg",
    },
    settings: {
      waterTargetMl: 2200,
      sleepTargetHours: 8.0,
      activityTargetMinutes: 40,
      timeZone: "Asia/Kolkata",
      aiPreferredLanguage: "en",
      aiResponseDetail: "balanced",
      enableBrowserNotifications: false,
    },
    documents: [
      {
        id: "doc-priya-1",
        userId: "demo-priya",
        title: "Thyroid & Complete Blood Count Panel",
        fileName: "CarePath_Thyroid_CBC_Dec2025.pdf",
        fileSize: 1150000,
        mimeType: "application/pdf",
        documentType: "Lab Report",
        documentDate: "2025-12-14",
        facility: "CarePath Diagnostics",
        doctor: "Dr. Sunita Rao, MD",
        uploadDate: "2025-12-14T11:00:00Z",
        status: "verified",
        extractedData: {
          documentId: "doc-priya-1",
          patientName: "Priya Patel",
          documentType: "Thyroid & Hematology Panel",
          documentDate: "2025-12-14",
          facility: "CarePath Diagnostics",
          doctorName: "Dr. Sunita Rao",
          diagnoses: ["Subclinical Hypothyroidism"],
          plainSummaryEn:
            "TSH measured at 4.6 mIU/L, slightly above upper reference limit of 4.2. Free T4 and Hemoglobin (13.2 g/dL) are within healthy limits.",
          plainSummaryHi:
            "TSH 4.6 mIU/L पर मापा गया, जो 4.2 की ऊपरी सीमा से थोड़ा अधिक है। फ्री T4 और हीमोग्लोबिन (13.2 g/dL) सामान्य सीमा में हैं।",
          keyObservations: [
            "TSH 4.6 mIU/L slightly elevated.",
            "Free T4 1.15 ng/dL normal.",
            "Hemoglobin 13.2 g/dL indicates resolved iron deficiency.",
          ],
          verificationNeeded: ["Repeat fasting TSH in 6 months."],
          questionsForClinician: ["Should we start low-dose Levothyroxine or simply monitor?"],
          uncertaintyDisclaimers: ["Informational summary."],
          labsCount: 3,
          medsCount: 0,
        },
      },
    ],
    labs: [
      {
        id: "lab-priya-tsh",
        documentId: "doc-priya-1",
        testName: "Thyroid Stimulating Hormone (TSH)",
        category: "Thyroid",
        valueNumeric: 4.6,
        valueText: "4.6",
        unit: "mIU/L",
        referenceLow: 0.4,
        referenceHigh: 4.2,
        referenceRangeText: "0.40 - 4.20 mIU/L",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2025-12-14",
        verified: true,
        clinicalExplanationEn: "TSH stimulates thyroid hormone production. Mild elevation suggests early subclinical thyroid response.",
        clinicalExplanationHi: "TSH थायरॉयड हार्मोन के उत्पादन को उत्तेजित करता है। हल्का बढ़ाव प्रारंभिक स्थिति को दर्शाता है।",
        confidenceScore: 0.98,
      },
    ],
    medications: [
      {
        id: "med-priya-1",
        userId: "demo-priya",
        name: "Vitamin D3 Cholecalciferol",
        strength: "60,000 IU",
        dosage: "1 capsule weekly",
        route: "Oral",
        frequency: "Once a week on Sunday",
        instructions: "Take with milk after breakfast.",
        instructionsHi: "रविवार को नाश्ते के बाद दूध के साथ लें।",
        startDate: "2025-11-01",
        status: "Active",
        userConfirmed: true,
        reminders: [
          { id: "rem-p1", time: "09:00", days: ["Sun"], enabled: true },
        ],
      },
    ],
    timeline: [
      {
        id: "time-priya-1",
        userId: "demo-priya",
        date: "2025-12-14",
        type: "lab",
        title: "Thyroid Function Test Analyzed",
        summary: "TSH slightly elevated at 4.6 mIU/L. Free T4 and CBC are normal.",
        summaryHi: "TSH थोड़ा बढ़ा हुआ 4.6 mIU/L। फ्री T4 और सीबीसी सामान्य।",
        documentId: "doc-priya-1",
      },
    ],
    wellness: [
      {
        id: "wel-p1",
        userId: "demo-priya",
        date: "2026-10-12",
        sleepHours: 8.0,
        steps: 8200,
        waterGlasses: 8.0,
        restingHeartRate: 68,
        bloodPressureSystolic: 116,
        bloodPressureDiastolic: 76,
        notes: "Pilates session completed in the morning.",
      },
    ],
    sleepEntries: [
      {
        id: "sleep-p1",
        userId: "demo-priya",
        date: "2026-10-12",
        bedtime: "22:45",
        wakeTime: "06:45",
        durationHours: 8.0,
        quality: "excellent",
        notes: "Great refreshing sleep.",
        createdAt: "2026-10-12T07:00:00Z",
      },
    ],
    waterEntries: [
      {
        id: "water-p1",
        userId: "demo-priya",
        date: "2026-10-12",
        amountMl: 2100,
        unit: "ml",
        targetMl: 2200,
        notes: "Infused lemon water.",
        createdAt: "2026-10-12T16:00:00Z",
      },
    ],
    mealEntries: [
      {
        id: "meal-p1",
        userId: "demo-priya",
        date: "2026-10-12",
        mealType: "breakfast",
        mealName: "Avocado Toast & Chia Pudding",
        foods: "Sourdough toast with mashed avocado, seeds, chia pudding with berries.",
        calories: 390,
        proteinG: 12,
        carbsG: 48,
        fatG: 18,
        isAiEstimated: false,
        notes: "High omega-3 breakfast.",
        createdAt: "2026-10-12T08:30:00Z",
      },
    ],
    activityEntries: [
      {
        id: "act-p1",
        userId: "demo-priya",
        date: "2026-10-12",
        activityType: "Morning Pilates & Stretching",
        durationMinutes: 45,
        steps: 4200,
        distanceKm: 2.8,
        intensity: "medium",
        caloriesBurned: 210,
        notes: "Core strength and mobility routine.",
        createdAt: "2026-10-12T08:00:00Z",
      },
    ],
    moodEntries: [
      {
        id: "mood-p1",
        userId: "demo-priya",
        date: "2026-10-12",
        mood: "great",
        notes: "Energized and productive.",
        createdAt: "2026-10-12T09:00:00Z",
      },
    ],
    journalEntries: [
      {
        id: "jour-p1",
        userId: "demo-priya",
        date: "2026-10-11",
        title: "Energy Levels Steadily High with Consistent Sleep",
        content: "Tracking 8 hours of sleep has eliminated afternoon sluggishness. Resting pulse is 68 bpm.",
        tags: ["Energy", "Sleep Routine", "Wellness"],
        clinicianQuestions: ["Should we repeat thyroid profile at 6-month interval?"],
        aiSummaryEn: "Patient reports steady daytime energy and normal pulse after maintaining 8-hour sleep consistency.",
        aiSummaryHi: "8 घंटे की नियमित नींद के बाद मरीज ने निरंतर ऊर्जा और सामान्य नाड़ी की सूचना दी।",
        appointmentPrepList: ["Discuss repeat TSH date with Dr. Rao."],
        createdAt: "2026-10-11T18:00:00Z",
        updatedAt: "2026-10-11T18:00:00Z",
      },
    ],
    conversations: [],
    messages: [],
    reminders: [
      {
        id: "rem-p1",
        userId: "demo-priya",
        title: "Sunday Cholecalciferol (Vitamin D3)",
        description: "60,000 IU capsule with milk after breakfast.",
        category: "medication",
        date: "2026-10-18",
        time: "09:30",
        recurrence: "weekly",
        enabled: true,
        completed: false,
        createdAt: "2026-10-01T00:00:00Z",
      },
      {
        id: "rem-p2",
        userId: "demo-priya",
        title: "Daily Hydration Target",
        description: "Drink 2200 ml of water throughout the day.",
        category: "water",
        date: "2026-10-12",
        time: "15:00",
        recurrence: "daily",
        enabled: true,
        completed: false,
        createdAt: "2026-10-01T00:00:00Z",
      },
    ],
  },
};

export class HealthoraStore {
  private activeProfileKey: string = "rajesh";
  private userCreatedAccounts: Record<string, ProfileState> = {};

  constructor() {
    this.ensureDataDir();
    this.loadFromDisk();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.activeProfileKey) this.activeProfileKey = parsed.activeProfileKey;
        if (parsed.userCreatedAccounts) this.userCreatedAccounts = parsed.userCreatedAccounts;
        if (parsed.demoProfiles) {
          Object.keys(parsed.demoProfiles).forEach((k) => {
            if (DEMO_PROFILES[k]) {
              DEMO_PROFILES[k] = { ...DEMO_PROFILES[k], ...parsed.demoProfiles[k] };
            }
          });
        }
      } else {
        this.saveToDisk();
      }
    } catch (e) {
      console.warn("Could not load database file, initializing default store:", e);
      this.saveToDisk();
    }
  }

  private saveToDisk() {
    try {
      this.ensureDataDir();
      const payload = {
        activeProfileKey: this.activeProfileKey,
        demoProfiles: DEMO_PROFILES,
        userCreatedAccounts: this.userCreatedAccounts,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to persist database to disk:", e);
    }
  }

  getActiveProfileKey(): string {
    return this.activeProfileKey;
  }

  setActiveProfileKey(key: string): boolean {
    if (DEMO_PROFILES[key] || this.userCreatedAccounts[key]) {
      this.activeProfileKey = key;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  resetDemo() {
    this.loadFromDisk();
    return true;
  }

  getOrCreateUserAccount(id: string, email?: string, name?: string): ProfileState {
    if (this.userCreatedAccounts[id]) {
      return this.userCreatedAccounts[id];
    }
    const newAccount: ProfileState = {
      profile: {
        id,
        name: name || "Personal Account",
        email: email || `${id}@healthora.local`,
        preferredLanguage: "en",
        allergies: [],
        chronicConditions: [],
      },
      settings: {
        waterTargetMl: 2500,
        sleepTargetHours: 8.0,
        activityTargetMinutes: 45,
        timeZone: "Asia/Kolkata",
        aiPreferredLanguage: "en",
        aiResponseDetail: "balanced",
        enableBrowserNotifications: false,
      },
      documents: [],
      labs: [],
      medications: [],
      timeline: [],
      wellness: [],
      sleepEntries: [],
      waterEntries: [],
      mealEntries: [],
      activityEntries: [],
      moodEntries: [],
      journalEntries: [],
      conversations: [],
      messages: [],
      reminders: [],
    };
    this.userCreatedAccounts[id] = newAccount;
    this.saveToDisk();
    return newAccount;
  }

  getCurrentState(userId?: string): ProfileState {
    const key = userId || this.activeProfileKey;
    if (this.userCreatedAccounts[key]) {
      return this.userCreatedAccounts[key];
    }
    if (DEMO_PROFILES[key]) {
      const state = DEMO_PROFILES[key];
      // Ensure all array fields are initialized
      state.sleepEntries = state.sleepEntries || [];
      state.waterEntries = state.waterEntries || [];
      state.mealEntries = state.mealEntries || [];
      state.activityEntries = state.activityEntries || [];
      state.moodEntries = state.moodEntries || [];
      state.journalEntries = state.journalEntries || [];
      state.conversations = state.conversations || [];
      state.messages = state.messages || [];
      state.reminders = state.reminders || [];
      state.settings = state.settings || {
        waterTargetMl: 2500,
        sleepTargetHours: 8.0,
        activityTargetMinutes: 45,
        timeZone: "Asia/Kolkata",
        aiPreferredLanguage: "en",
        aiResponseDetail: "balanced",
        enableBrowserNotifications: false,
      };
      return state;
    }
    // If a custom or Supabase userId was passed, auto-provision blank personal state
    if (userId && !DEMO_PROFILES[userId]) {
      return this.getOrCreateUserAccount(userId);
    }
    if (!DEMO_PROFILES[this.activeProfileKey]) {
      this.activeProfileKey = "rajesh";
    }
    return DEMO_PROFILES[this.activeProfileKey];
  }

  createAccount(name: string, email: string) {
    const id = `user-${Date.now()}`;
    const newAccount = this.getOrCreateUserAccount(id, email, name);
    this.activeProfileKey = id;
    this.saveToDisk();
    return newAccount.profile;
  }

  // DOCUMENTS
  addDocument(doc: MedicalDocument, userId?: string) {
    const state = this.getCurrentState(userId);
    state.documents.unshift(doc);
    this.saveToDisk();
    return doc;
  }

  updateDocument(docId: string, updates: Partial<MedicalDocument>, userId?: string) {
    const state = this.getCurrentState(userId);
    const idx = state.documents.findIndex((d) => d.id === docId);
    if (idx !== -1) {
      state.documents[idx] = { ...state.documents[idx], ...updates };
      this.saveToDisk();
      return state.documents[idx];
    }
    return null;
  }

  deleteDocument(docId: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.documents = state.documents.filter((d) => d.id !== docId);
    state.labs = state.labs.filter((l) => l.documentId !== docId);
    state.medications = state.medications.filter((m) => m.documentId !== docId);
    state.timeline = state.timeline.filter((t) => t.documentId !== docId);
    this.saveToDisk();
  }

  // LABS
  addLabResult(lab: ExtractedLabResult, userId?: string) {
    const state = this.getCurrentState(userId);
    state.labs.push(lab);
    this.saveToDisk();
    return lab;
  }

  updateLabResult(labId: string, updates: Partial<ExtractedLabResult>, userId?: string) {
    const state = this.getCurrentState(userId);
    const idx = state.labs.findIndex((l) => l.id === labId);
    if (idx !== -1) {
      state.labs[idx] = { ...state.labs[idx], ...updates };
      this.saveToDisk();
      return state.labs[idx];
    }
    return null;
  }

  // MEDICATIONS
  addMedication(med: MedicationItem, userId?: string) {
    const state = this.getCurrentState(userId);
    state.medications.push(med);
    this.saveToDisk();
    return med;
  }

  updateMedication(medId: string, updates: Partial<MedicationItem>, userId?: string) {
    const state = this.getCurrentState(userId);
    const idx = state.medications.findIndex((m) => m.id === medId);
    if (idx !== -1) {
      state.medications[idx] = { ...state.medications[idx], ...updates };
      this.saveToDisk();
      return state.medications[idx];
    }
    return null;
  }

  // TIMELINE
  addTimelineEvent(event: TimelineEvent, userId?: string) {
    const state = this.getCurrentState(userId);
    state.timeline.unshift(event);
    this.saveToDisk();
    return event;
  }

  // WELLNESS
  addWellnessEntry(entry: WellnessEntry, userId?: string) {
    const state = this.getCurrentState(userId);
    state.wellness = state.wellness.filter((w) => w.date !== entry.date);
    state.wellness.push(entry);
    state.wellness.sort((a, b) => a.date.localeCompare(b.date));
    this.saveToDisk();
    return entry;
  }

  // PROFILE & SETTINGS
  updateProfile(updates: Partial<UserProfile>, userId?: string) {
    const state = this.getCurrentState(userId);
    state.profile = { ...state.profile, ...updates };
    this.saveToDisk();
    return state.profile;
  }

  updateSettings(updates: Partial<UserSettings>, userId?: string) {
    const state = this.getCurrentState(userId);
    state.settings = { ...state.settings, ...updates };
    this.saveToDisk();
    return state.settings;
  }

  // SLEEP
  addSleepEntry(entry: SleepEntry, userId?: string) {
    const state = this.getCurrentState(userId);
    state.sleepEntries = (state.sleepEntries || []).filter((s) => s.date !== entry.date);
    state.sleepEntries.push(entry);
    state.sleepEntries.sort((a, b) => a.date.localeCompare(b.date));
    this.saveToDisk();
    return entry;
  }

  deleteSleepEntry(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.sleepEntries = (state.sleepEntries || []).filter((s) => s.id !== id);
    this.saveToDisk();
  }

  // WATER
  addWaterEntry(entry: WaterEntry, userId?: string) {
    const state = this.getCurrentState(userId);
    state.waterEntries = state.waterEntries || [];
    const existing = state.waterEntries.find((w) => w.date === entry.date);
    if (existing) {
      existing.amountMl = entry.amountMl;
      existing.targetMl = entry.targetMl;
      existing.notes = entry.notes || existing.notes;
    } else {
      state.waterEntries.push(entry);
    }
    state.waterEntries.sort((a, b) => a.date.localeCompare(b.date));
    this.saveToDisk();
    return existing || entry;
  }

  // MEALS
  addMealEntry(entry: MealEntry, userId?: string) {
    const state = this.getCurrentState(userId);
    state.mealEntries = state.mealEntries || [];
    state.mealEntries.unshift(entry);
    this.saveToDisk();
    return entry;
  }

  updateMealEntry(id: string, updates: Partial<MealEntry>, userId?: string) {
    const state = this.getCurrentState(userId);
    state.mealEntries = state.mealEntries || [];
    const idx = state.mealEntries.findIndex((m) => m.id === id);
    if (idx !== -1) {
      state.mealEntries[idx] = { ...state.mealEntries[idx], ...updates };
      this.saveToDisk();
      return state.mealEntries[idx];
    }
    return null;
  }

  deleteMealEntry(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.mealEntries = (state.mealEntries || []).filter((m) => m.id !== id);
    this.saveToDisk();
  }

  // ACTIVITY
  addActivityEntry(entry: ActivityEntry, userId?: string) {
    const state = this.getCurrentState(userId);
    state.activityEntries = state.activityEntries || [];
    state.activityEntries.unshift(entry);
    this.saveToDisk();
    return entry;
  }

  deleteActivityEntry(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.activityEntries = (state.activityEntries || []).filter((a) => a.id !== id);
    this.saveToDisk();
  }

  // MOOD
  addMoodEntry(entry: MoodEntry, userId?: string) {
    const state = this.getCurrentState(userId);
    state.moodEntries = (state.moodEntries || []).filter((m) => m.date !== entry.date);
    state.moodEntries.push(entry);
    state.moodEntries.sort((a, b) => a.date.localeCompare(b.date));
    this.saveToDisk();
    return entry;
  }

  deleteMoodEntry(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.moodEntries = (state.moodEntries || []).filter((m) => m.id !== id);
    this.saveToDisk();
  }

  // HEALTH JOURNAL
  addJournalEntry(entry: HealthJournalEntry, userId?: string) {
    const state = this.getCurrentState(userId);
    state.journalEntries = state.journalEntries || [];
    state.journalEntries.unshift(entry);
    this.saveToDisk();
    return entry;
  }

  updateJournalEntry(id: string, updates: Partial<HealthJournalEntry>, userId?: string) {
    const state = this.getCurrentState(userId);
    state.journalEntries = state.journalEntries || [];
    const idx = state.journalEntries.findIndex((j) => j.id === id);
    if (idx !== -1) {
      state.journalEntries[idx] = {
        ...state.journalEntries[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveToDisk();
      return state.journalEntries[idx];
    }
    return null;
  }

  deleteJournalEntry(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.journalEntries = (state.journalEntries || []).filter((j) => j.id !== id);
    this.saveToDisk();
  }

  // AI CONVERSATIONS & MESSAGES
  createConversation(title: string, pageContext?: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.conversations = state.conversations || [];
    const conv: AIConversation = {
      id: `conv-${Date.now()}`,
      userId: state.profile.id,
      title: title || "New Conversation",
      pageContext: pageContext || "overview",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.conversations.unshift(conv);
    this.saveToDisk();
    return conv;
  }

  addAIMessage(msg: AIMessage, userId?: string) {
    const state = this.getCurrentState(userId);
    state.messages = state.messages || [];
    state.messages.push(msg);
    const conv = (state.conversations || []).find((c) => c.id === msg.conversationId);
    if (conv) {
      conv.updatedAt = new Date().toISOString();
    }
    this.saveToDisk();
    return msg;
  }

  deleteConversation(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.conversations = (state.conversations || []).filter((c) => c.id !== id);
    state.messages = (state.messages || []).filter((m) => m.conversationId !== id);
    this.saveToDisk();
  }

  clearConversation(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.messages = (state.messages || []).filter((m) => m.conversationId !== id);
    this.saveToDisk();
  }

  // REMINDERS
  addReminder(reminder: ReminderItem, userId?: string) {
    const state = this.getCurrentState(userId);
    state.reminders = state.reminders || [];
    state.reminders.unshift(reminder);
    this.saveToDisk();
    return reminder;
  }

  updateReminder(id: string, updates: Partial<ReminderItem>, userId?: string) {
    const state = this.getCurrentState(userId);
    state.reminders = state.reminders || [];
    const idx = state.reminders.findIndex((r) => r.id === id);
    if (idx !== -1) {
      state.reminders[idx] = { ...state.reminders[idx], ...updates };
      this.saveToDisk();
      return state.reminders[idx];
    }
    return null;
  }

  deleteReminder(id: string, userId?: string) {
    const state = this.getCurrentState(userId);
    state.reminders = (state.reminders || []).filter((r) => r.id !== id);
    this.saveToDisk();
  }

  // PRIVACY DATA DELETION
  deleteCategory(category: "conversations" | "journal" | "documents" | "tracking", userId?: string) {
    const state = this.getCurrentState(userId);
    if (category === "conversations") {
      state.conversations = [];
      state.messages = [];
    } else if (category === "journal") {
      state.journalEntries = [];
    } else if (category === "documents") {
      state.documents = [];
      state.labs = [];
      state.medications = [];
      state.timeline = state.timeline.filter((t) => t.type !== "document" && t.type !== "lab");
    } else if (category === "tracking") {
      state.sleepEntries = [];
      state.waterEntries = [];
      state.mealEntries = [];
      state.activityEntries = [];
      state.moodEntries = [];
      state.wellness = [];
    }
    this.saveToDisk();
  }
}

export const store = new HealthoraStore();
