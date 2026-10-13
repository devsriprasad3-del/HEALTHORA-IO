import React, { useState } from "react";
import {
  PhoneCall,
  ShieldAlert,
  Ambulance,
  Shield,
  Phone,
  Copy,
  Check,
  UserPlus,
  Heart,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersonalContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [personalContacts, setPersonalContacts] = useState<PersonalContact[]>(() => {
    const saved = localStorage.getItem("healthora_emergency_contacts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "c1", name: "Dr. Arvind Mehta", relation: "Attending Physician", phone: "+91 98450 12345" },
      { id: "c2", name: "Sunita Sharma", relation: "Spouse / Next of Kin", phone: "+91 98450 67890" },
    ];
  });

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("Family");
  const [newContactPhone, setNewContactPhone] = useState("");

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: PersonalContact = {
      id: `pc-${Date.now()}`,
      name: newContactName.trim(),
      relation: newContactRelation,
      phone: newContactPhone.trim(),
    };

    const updated = [...personalContacts, newContact];
    setPersonalContacts(updated);
    localStorage.setItem("healthora_emergency_contacts", JSON.stringify(updated));
    setIsAddingContact(false);
    setNewContactName("");
    setNewContactPhone("");
  };

  const handleDeleteContact = (id: string) => {
    const updated = personalContacts.filter((c) => c.id !== id);
    setPersonalContacts(updated);
    localStorage.setItem("healthora_emergency_contacts", JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header with SOS Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-extrabold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>{t("sosAlert")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t("emergencyTitle")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("emergencySubtitle")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Critical Patient Medical ID Banner */}
        {user && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Patient Name</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {user.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Blood Group</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm mt-0.5 block font-mono">
                {user.bloodGroup || "B+"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Critical Allergies</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                {user.allergies && user.allergies.length > 0 ? user.allergies.join(", ") : "None reported"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Chronic Conditions</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                {user.chronicConditions && user.chronicConditions.length > 0
                  ? user.chronicConditions[0]
                  : "Type 2 Diabetes"}
              </span>
            </div>
          </div>
        )}

        {/* Primary National Emergency Numbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Ambulance Service (108 / 102) */}
          <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {t("ambulanceService")}
                  </h3>
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold">
                    Free / 24x7 Dispatch
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("ambulanceDesc")}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="tel:108"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md transition-colors"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Call 108</span>
              </a>

              <a
                href="tel:102"
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-50 transition-colors"
                title="Secondary Ambulance Line"
              >
                102
              </a>

              <button
                onClick={() => handleCopy("amb", "108")}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy number"
              >
                {copiedId === "amb" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2. Police Assistance (100 / 112) */}
          <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/60 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {t("policeService")}
                  </h3>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                    Police Emergency Dispatch
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("policeDesc")}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="tel:100"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 100</span>
              </a>

              <a
                href="tel:112"
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-50 transition-colors"
                title="Unified National Emergency"
              >
                112
              </a>

              <button
                onClick={() => handleCopy("pol", "100")}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy number"
              >
                {copiedId === "pol" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary National & Special Helplines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Unified Emergency 112 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{t("unifiedEmergency")}</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black">112</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Single pan-India emergency response (ERSS)
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="tel:112"
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Dial 112
              </a>
              <button
                onClick={() => handleCopy("u112", "112")}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Copy 112"
              >
                {copiedId === "u112" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Health Helpline 1075 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{t("healthHelpline")}</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-black">1075</span>
              </div>
              <div className="text-[11px] text-slate-500">
                National Ministry of Health & Family Welfare
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="tel:1075"
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors whitespace-nowrap"
              >
                Dial 1075
              </a>
              <button
                onClick={() => handleCopy("h1075", "1075")}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Copy 1075"
              >
                {copiedId === "h1075" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Fire & Rescue 101 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Fire & Rescue</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-black">101</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Emergency fire safety & hazard control
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="tel:101"
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                Dial 101
              </a>
              <button
                onClick={() => handleCopy("f101", "101")}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Copy 101"
              >
                {copiedId === "f101" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Women Police Helpline 1091 / 181 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Women Helpline / Police</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-black">1091</span>
              </div>
              <div className="text-[11px] text-slate-500">
                24x7 Women distress assistance & safety
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="tel:1091"
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors whitespace-nowrap"
              >
                Dial 1091
              </a>
              <button
                onClick={() => handleCopy("w1091", "1091")}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Copy 1091"
              >
                {copiedId === "w1091" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Global Travel Reference */}
        <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            International Equivalent Emergency Numbers:
          </span>
          <div className="flex items-center gap-3 font-mono">
            <span>USA / Canada: <strong className="text-slate-900 dark:text-white">911</strong></span>
            <span>UK: <strong className="text-slate-900 dark:text-white">999</strong></span>
            <span>EU: <strong className="text-slate-900 dark:text-white">112</strong></span>
          </div>
        </div>

        {/* Personal Emergency Contacts Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{t("personalEmergencyContacts")}</span>
            </h3>

            {!isAddingContact && (
              <button
                onClick={() => setIsAddingContact(true)}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t("addEmergencyContact")}</span>
              </button>
            )}
          </div>

          {/* Add Contact Form */}
          {isAddingContact && (
            <form onSubmit={handleAddContactSubmit} className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Contact Name (e.g., Dr. R. Patel)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g., Doctor, Sibling)"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone (e.g., +91 98450...)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Contact List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {contact.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {contact.relation} · <span className="font-mono text-slate-600 dark:text-slate-300">{contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                    className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                    title="Direct Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span>In acute medical or trauma emergencies, always immediately dial 108 or 112.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
