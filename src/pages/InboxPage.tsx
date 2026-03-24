import { useState, useRef, useEffect } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import {
  Sparkles, CheckCircle2, Reply, Inbox, AlertCircle, Zap, Send,
  Calendar, Clock, MoreHorizontal, Search, Filter, RefreshCw,
  ThumbsUp, ThumbsDown, Minus, ChevronRight, PauseCircle,
  Mail, MailOpen, User, Building2, X,
} from "lucide-react";
import { toast } from "sonner";

type FilterType = "All" | "Interested" | "Not Interested" | "Neutral" | "Unread";

const CLASSIFICATION_CONFIG = {
  Interested: {
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    icon: ThumbsUp,
    dot: "bg-emerald-500",
    label: "Positive Intent",
  },
  "Not Interested": {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    icon: ThumbsDown,
    dot: "bg-slate-400",
    label: "Not Interested",
  },
  Neutral: {
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: Minus,
    dot: "bg-blue-500",
    label: "Neutral",
  },
};

const AI_REPLIES = {
  Interested:
    "Hi {{first_name}}, great to hear from you! I'd love to set up a quick 30-minute demo to walk you through exactly how we can help {{company}}. How does Thursday at 2pm or Friday at 10am work for you?",
  Neutral:
    "Hi {{first_name}}, thanks for getting back to me! Happy to share more context — would a brief 15-minute call this week work for you to explore if there's a fit?",
  "Not Interested":
    "Hi {{first_name}}, completely understand — timing isn't always right. I'll circle back in a few months. Feel free to reach out anytime if things change. Wishing you and the {{company}} team all the best!",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const timeAgo = (time: string) => time;

const InboxPage = () => {
  const { inbox, simulateReply, markConverted, leads } = useSales();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  const [simulating, setSimulating] = useState(false);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selected = inbox.find((t) => t.id === selectedId) ?? inbox[0] ?? null;

  // Auto-populate AI reply when switching threads
  useEffect(() => {
    if (selected) {
      const template =
        AI_REPLIES[selected.classification] ||
        AI_REPLIES["Neutral"];
      setReplyText(
        template
          .replace("{{first_name}}", selected.name.split(" ")[0])
          .replace("{{company}}", selected.company)
      );
    }
  }, [selected?.id]);

  const filtered = inbox.filter((t) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Unread" && t.unread) ||
      t.classification === filter;
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.company.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = inbox.filter((t) => t.unread).length;
  const interestedCount = inbox.filter((t) => t.classification === "Interested").length;

  const handleSimulate = () => {
    setSimulating(true);
    simulateReply();
    setTimeout(() => {
      setSimulating(false);
      toast.info("📨 New reply received — AI classified automatically");
    }, 1200);
  };

  const handleMarkConverted = () => {
    if (selected) {
      markConverted(selected.id);
      toast.success(`✅ ${selected.name} marked as converted — meeting booked!`);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) { toast.error("Write a reply first"); return; }
    setSendingReply(true);
    setTimeout(() => {
      setSendingReply(false);
      setShowReplyComposer(false);
      toast.success(`Reply sent to ${selected?.name}!`);
    }, 1000);
  };

  const handleBookMeeting = () => {
    if (selected) {
      markConverted(selected.id);
      toast.success(`📅 Meeting booked with ${selected.name}! Added to Calendar.`);
    }
  };

  const cfg = selected ? CLASSIFICATION_CONFIG[selected.classification] : null;

  return (
    <>
      <TopNavbar title="Inbox" subtitle="AI-classified replies · Sequence auto-stop on positive intent" />

      {/* Stats Bar */}
      <div className="px-6 pt-4 pb-0 flex items-center gap-4">
        {[
          { label: "Total Threads", value: inbox.length, color: "text-foreground" },
          { label: "Unread", value: unreadCount, color: "text-blue-600" },
          { label: "Positive Intent", value: interestedCount, color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-sm">
            <span className={`font-bold ${color}`}>{value}</span>
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="text-border">·</span>
          </div>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-primary/40 text-xs text-primary font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5" />
          {simulating ? "Receiving..." : "Simulate Reply"}
        </button>
      </div>

      {inbox.length === 0 ? (
        <main className="flex-1 p-6">
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Inbox className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Inbox is empty</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Launch a campaign first. When prospects reply, AI will classify them and auto-pause sequences for positive responses.
            </p>
            <button
              onClick={handleSimulate}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Zap className="w-4 h-4" /> Simulate First Reply
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 overflow-hidden flex" style={{ height: "calc(100vh - 130px)" }}>
          {/* ── Thread List Panel ── */}
          <div className="w-80 xl:w-96 flex-shrink-0 border-r border-border flex flex-col bg-card/50">
            {/* Filters */}
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search threads..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {(["All", "Unread", "Interested", "Neutral", "Not Interested"] as FilterType[]).map((f) => {
                  const counts: Record<string, number> = {
                    All: inbox.length,
                    Unread: unreadCount,
                    Interested: inbox.filter((t) => t.classification === "Interested").length,
                    Neutral: inbox.filter((t) => t.classification === "Neutral").length,
                    "Not Interested": inbox.filter((t) => t.classification === "Not Interested").length,
                  };
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                        filter === f
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f === "Not Interested" ? "Not Int." : f}
                      {counts[f] > 0 && (
                        <span className={`ml-1 ${filter === f ? "opacity-80" : "opacity-60"}`}>({counts[f]})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No threads match this filter</div>
              ) : (
                filtered.map((t) => {
                  const threadCfg = CLASSIFICATION_CONFIG[t.classification];
                  const isActive = selected?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`px-4 py-3.5 border-b border-border cursor-pointer transition-all ${
                        isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {initials(t.name)}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${threadCfg.dot}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className={`text-xs ${t.unread ? "font-bold text-foreground" : "font-medium text-foreground"} truncate`}>
                              {t.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">{t.time}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mb-1">{t.company}</p>
                          <p className={`text-xs truncate mb-1.5 ${t.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {t.subject}
                          </p>
                          <div className="flex items-center gap-2">
                            {t.unread && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${threadCfg.badge}`}>
                              {t.classification}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-1 transition-transform ${isActive ? "opacity-100" : "opacity-0"}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Thread Detail Panel ── */}
          {selected ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Thread header */}
              <div className="px-6 py-4 border-b border-border bg-card/50 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground leading-tight truncate">{selected.subject}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      {selected.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      {selected.company}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {selected.time}
                    </div>
                    {cfg && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.badge} flex items-center gap-1`}>
                        <cfg.icon className="w-2.5 h-2.5" />
                        {selected.classification}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Thread body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Sequence auto-pause alert */}
                {selected.classification === "Interested" && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in">
                    <PauseCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Sequence auto-paused for {selected.name}</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Positive reply detected — no further follow-ups will be sent. Reply manually or book a meeting.
                      </p>
                    </div>
                  </div>
                )}

                {/* Message bubble */}
                <div className="glass-card p-5 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {initials(selected.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.company} · {selected.time}</p>
                    </div>
                    <div className="ml-auto">
                      {selected.unread ? (
                        <span className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                          <MailOpen className="w-3 h-3" /> New
                        </span>
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{selected.preview}</p>
                </div>

                {/* AI Suggested Reply */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">AI Suggested Reply</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-full">
                      Based on: {selected.classification}
                    </span>
                  </div>

                  {/* Reply text area (pre-filled with AI suggestion) */}
                  {showReplyComposer ? (
                    <div className="space-y-3">
                      <textarea
                        ref={textareaRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground leading-relaxed"
                        placeholder="Write your reply..."
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSendReply}
                          disabled={sendingReply}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {sendingReply ? (
                            <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {sendingReply ? "Sending..." : "Send Reply"}
                        </button>
                        <button
                          onClick={() => setShowReplyComposer(false)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">
                        "{replyText}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setShowReplyComposer(true);
                            setTimeout(() => textareaRef.current?.focus(), 50);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Reply className="w-3.5 h-3.5" /> Use This Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyText("");
                            setShowReplyComposer(true);
                            setTimeout(() => textareaRef.current?.focus(), 50);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-card transition-colors text-foreground"
                        >
                          <Reply className="w-3.5 h-3.5" /> Write Custom
                        </button>
                        {selected.classification === "Interested" && (
                          <button
                            onClick={handleBookMeeting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Book Meeting
                          </button>
                        )}
                        <button
                          onClick={handleMarkConverted}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Converted
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Mail className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a thread to read</p>
              </div>
            </div>
          )}
        </main>
      )}
    </>
  );
};

export default InboxPage;
