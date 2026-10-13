import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Plus,
  Send,
  Sparkles,
  Search,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Globe,
  HelpCircle,
  Pill,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { AIConversation, AIMessage, ViewTab } from "../../types/health.js";

interface AIBotsViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  initialPageContext?: string;
  initialPrompt?: string;
}

export const AIBotsView: React.FC<AIBotsViewProps> = ({
  onNavigateTab,
  initialPageContext = "overview",
  initialPrompt = "",
}) => {
  const { user, activeProfileKey } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState<string>(initialPrompt);
  const [loadingConv, setLoadingConv] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Context Selector: lets user focus AI Bots on a specific clinical domain
  const [selectedContext, setSelectedContext] = useState<string>(initialPageContext);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoadingConv(true);
      const res = await fetch("/api/ai-bots/conversations");
      const data = await res.json();
      const list = data.conversations || [];
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/ai-bots/conversations/${convId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeProfileKey]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      const title =
        language === "hi" ? "नई स्वास्थ्य परामर्श बातचीत" : "New Health Consultation";
      const res = await fetch("/api/ai-bots/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, pageContext: selectedContext }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations([data.conversation, ...conversations]);
        setActiveConvId(data.conversation.id);
        setMessages([]);
      }
    } catch (err) {
      setChatError("Failed to create conversation");
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai-bots/conversations/${id}`, { method: "DELETE" });
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  // Clear current conversation messages
  const handleClearMessages = async () => {
    if (!activeConvId) return;
    try {
      await fetch(`/api/ai-bots/conversations/${activeConvId}/clear`, { method: "POST" });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear messages:", err);
    }
  };

  // Send message to Gemini
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setChatError(null);
    setIsSending(true);

    // Optimistically show user bubble
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId || "new",
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      pageContext: selectedContext,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText("");
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch("/api/ai-bots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          message: text,
          pageContext: selectedContext,
          language: language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (!activeConvId) {
          setActiveConvId(data.conversationId);
          fetchConversations();
        }
        // Replace temp or append model response
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          {
            ...tempUserMsg,
            id: `msg-${Date.now()}-u`,
            conversationId: data.conversationId,
          },
          data.message,
        ]);
        setTimeout(scrollToBottom, 100);
      } else {
        setChatError(data.error || "Failed to get response from Gemini");
      }
    } catch (err: any) {
      setChatError(err?.message || "Network error communicating with AI Bots");
    } finally {
      setIsSending(false);
    }
  };

  // Copy Response
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Suggested Questions
  const suggestedQuestions = [
    {
      en: "Summarize my sleep entries from the past seven days.",
      hi: "पिछले सात दिनों की मेरी नींद का सारांश दें।",
      context: "tracking",
    },
    {
      en: "How much water did I log today and am I on track?",
      hi: "मैंने आज कितना पानी पिया और क्या मैं लक्ष्य पर हूँ?",
      context: "tracking",
    },
    {
      en: "Explain my latest uploaded laboratory report.",
      hi: "मेरी हालिया लैब रिपोर्ट के मुख्य परिणाम समझाएं।",
      context: "records",
    },
    {
      en: "Prepare questions I can ask Dr. Verma at my next visit.",
      hi: "अगली डॉक्टर मुलाक़ात के लिए जरूरी प्रश्न तैयार करें।",
      context: "journal",
    },
    {
      en: "What active medications do I have and their schedules?",
      hi: "मेरी कौन सी दवाएं सक्रिय हैं और उनका समय क्या है?",
      context: "reminders",
    },
    {
      en: "Explain this health information in Hindi (शुद्ध हिन्दी में).",
      hi: "इस स्वास्थ्य जानकारी को सरल हिंदी में समझाएं।",
      context: "overview",
    },
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] max-w-7xl mx-auto rounded-2xl overflow-hidden bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xl animate-fade-in">
      {/* 1. LEFT SIDEBAR: Conversations List */}
      <div className="w-72 sm:w-80 border-r border-[#E4EAF1] dark:border-[#1B2D48] bg-slate-50/60 dark:bg-[#0D1628] flex flex-col justify-between shrink-0 hidden md:flex">
        {/* Top: Header & New Chat */}
        <div className="p-4 border-b border-[#E4EAF1] dark:border-[#1B2D48] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#16B8A6]/10 text-[#16B8A6]">
                <Brain className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-[#142238] dark:text-white">AI Bots</h2>
                <span className="text-[10px] text-[#66E3D3] font-semibold uppercase tracking-wider block">
                  Gemini 3.8 Flash
                </span>
              </div>
            </div>

            <button
              onClick={handleNewConversation}
              className="p-1.5 rounded-lg bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold transition-all shadow-xs"
              title={t("newConversation")}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search Conversations */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchConversations")}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations found. Click + to begin a new consultation.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConvId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#16B8A6]/15 text-[#66E3D3] border border-[#16B8A6]/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#172944]"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate font-bold">{conv.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-md transition-opacity"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Profile Info */}
        <div className="p-3 border-t border-[#E4EAF1] dark:border-[#1B2D48] text-[11px] text-slate-500 flex items-center justify-between">
          <span className="truncate">{user?.name}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#16B8A6]/10 text-[#16B8A6] font-bold">
            {language === "hi" ? "हिन्दी" : "English"}
          </span>
        </div>
      </div>

      {/* 2. RIGHT / MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#101C31]">
        {/* Top Context & Controls Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#E4EAF1] dark:border-[#1B2D48] flex flex-wrap items-center justify-between gap-3 bg-white/80 dark:bg-[#101C31]/80 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-[#16B8A6]/10 text-[#16B8A6] shrink-0">
              <Brain className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#142238] dark:text-white truncate">
                  AI Bots
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#16B8A6] border border-teal-200 dark:border-teal-900/60 shrink-0">
                  Grounding Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{t("aiBotsSubtitle")}</p>
            </div>
          </div>

          {/* Context Selector Pill & Clear button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#F5F7FB] dark:bg-[#172944] px-2.5 py-1 rounded-xl border border-[#E4EAF1] dark:border-[#1B2D48] text-xs">
              <Layers className="w-3.5 h-3.5 text-[#16B8A6]" />
              <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Context:</span>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
              >
                <option value="overview">Overview Dashboard</option>
                <option value="tracking">Daily Tracking (Sleep, Water, Meals, Activity)</option>
                <option value="records">Medical Records & Labs</option>
                <option value="journal">Health Journal & Doctor Questions</option>
                <option value="reminders">Reminders & Medications</option>
              </select>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleClearMessages}
                className="p-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172944] transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Welcome Card if no messages */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-8 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#16B8A6] to-[#66E3D3] flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
                <Brain className="w-7 h-7 text-[#101C31]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#142238] dark:text-white">
                  {language === "hi"
                    ? "हेल्थोरा एआई बॉट्स में आपका स्वागत है"
                    : "Welcome to Healthora AI Bots"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
                  {language === "hi"
                    ? "आपकी वास्तविक रिपोर्टों, दैनिक वेलनेस प्रविष्टियों और क्लिनिकल समयरेखा पर आधारित बुद्धिमान, प्रामाणिक व सुरक्षित स्वास्थ्य जानकारी।"
                    : "An intelligent healthcare information assistant grounded strictly in your authenticated medical records, laboratory findings, and daily tracking logs."}
                </p>
              </div>

              {/* Emergency Banner Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-left text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{t("emergencyWarning")}</span>
              </div>

              {/* Suggested Questions Grid */}
              <div className="pt-2 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {language === "hi" ? "सुझाए गए प्रश्न:" : "Suggested Inquiries:"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((q, idx) => {
                    const label = language === "hi" ? q.hi : q.en;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedContext(q.context);
                          handleSendMessage(label);
                        }}
                        className="p-3 text-left rounded-xl bg-[#F5F7FB] hover:bg-[#E6F8F4] dark:bg-[#172944] dark:hover:bg-[#1B2D48] text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between group"
                      >
                        <span className="pr-2">{label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#16B8A6] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#16B8A6]/10 text-[#16B8A6] flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed transition-all ${
                    isUser
                      ? "bg-[#16B8A6] text-[#101C31] font-medium shadow-md rounded-br-xs"
                      : "bg-[#F5F7FB] dark:bg-[#172944] text-[#142238] dark:text-slate-100 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs rounded-bl-xs"
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-line prose-xs dark:prose-invert">
                    {msg.content}
                  </div>

                  {/* Sources Grounding Indicator (for model responses) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#16B8A6] uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{t("sourcesUsed")}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-[#101C31] text-slate-600 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-800"
                            title={src.detail}
                          >
                            {src.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action toolbar (copy) */}
                  {!isUser && (
                    <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="flex items-center gap-1 hover:text-[#16B8A6] transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#16B8A6]" />
                            <span className="text-[#16B8A6] font-bold">{t("copied")}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t("copyResponse")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing / Streaming Indicator */}
          {isSending && (
            <div className="flex items-center gap-3 text-xs text-slate-400 mr-auto">
              <div className="w-8 h-8 rounded-xl bg-[#16B8A6]/10 text-[#16B8A6] flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex items-center gap-1 p-3 rounded-2xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48]">
                <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-2 text-[11px] font-semibold text-slate-500">
                  Healthora Gemini synthesizing response...
                </span>
              </div>
            </div>
          )}

          {/* Chat Error State */}
          {chatError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{chatError}</span>
              </div>
              <button
                onClick={() => handleSendMessage()}
                className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-500"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 border-t border-[#E4EAF1] dark:border-[#1B2D48] bg-white dark:bg-[#101C31]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("askHealthoraPlaceholder")}
                disabled={isSending}
                className="w-full pl-4 pr-10 py-3 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#16B8A6] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="p-3 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send to AI Bots"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Google Gemini (gemini-3.8-flash) • Strict clinical grounding</span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
