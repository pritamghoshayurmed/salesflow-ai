import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import { Sparkles, CheckCircle2, Reply, Inbox, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";

const classificationBadge = (c: string) => {
  const map: Record<string, string> = {
    Interested: "badge-success",
    "Not Interested": "badge-neutral",
    Neutral: "badge-info",
  };
  return map[c] || "badge-neutral";
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

const InboxPage = () => {
  const { inbox, simulateReply, markConverted } = useSales();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"All" | "Interested" | "Booked">("All");
  const [simulating, setSimulating] = useState(false);

  const selected = inbox.find((t) => t.id === selectedId) || inbox[0] || null;

  const filtered = inbox.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Interested") return t.classification === "Interested";
    if (filter === "Booked") return t.classification === "Interested" && !t.unread;
    return true;
  });

  const handleSimulate = () => {
    setSimulating(true);
    simulateReply();
    setTimeout(() => {
      setSimulating(false);
      toast.info("New reply received! AI classification applied.");
    }, 1200);
  };

  const handleMarkConverted = () => {
    if (selected) {
      markConverted(selected.id);
      toast.success(`${selected.name} marked as converted — meeting booked!`);
    }
  };

  return (
    <>
      <TopNavbar title="Inbox" subtitle="Manage replies and conversations" />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Actions bar */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          {(["All", "Interested", "Booked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "Interested" ? "Positive Intent" : f === "Booked" ? "Meeting Booked" : f}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-dashed border-primary/40 text-sm text-primary font-medium hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {simulating ? "Incoming..." : "Simulate Incoming Reply"}
          </button>
        </div>

        {inbox.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Inbox is empty</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Launch a campaign first, then simulate replies to see AI classification in action.
            </p>
            <button
              onClick={handleSimulate}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Zap className="w-4 h-4" /> Simulate First Reply
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex">
            {/* Thread List */}
            <div className="w-full md:w-96 border-r border-border overflow-y-auto">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`px-4 py-4 border-b border-border cursor-pointer transition-colors ${
                    selected?.id === t.id ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {initials(t.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${t.unread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{t.name}</span>
                        <span className="text-xs text-muted-foreground">{t.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.company}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground ml-11 mb-1">{t.subject}</p>
                  <p className="text-xs text-muted-foreground ml-11 truncate">{t.preview}</p>
                  <div className="ml-11 mt-2 flex items-center gap-2">
                    <span className={classificationBadge(t.classification)}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t.classification}
                    </span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No threads match this filter.</div>
              )}
            </div>

            {/* Thread Detail */}
            {selected && (
              <div className="flex-1 hidden md:flex flex-col">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-bold text-foreground">{selected.subject}</h3>
                  <p className="text-sm text-muted-foreground">{selected.name} · {selected.company}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {/* System alert for positive replies */}
                  {selected.classification === "Interested" && (
                    <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">Sequence automatically paused for {selected.name}</p>
                        <p className="text-xs text-muted-foreground">Positive reply detected — AI has paused outreach to avoid sending follow-ups.</p>
                      </div>
                    </div>
                  )}

                  <div className="glass-card p-6 mb-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {initials(selected.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{selected.name}</p>
                        <p className="text-xs text-muted-foreground">{selected.time}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{selected.preview}</p>
                  </div>

                  {/* AI Suggested Reply */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">AI Suggested Reply</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      "Hi {selected.name.split(" ")[0]}, great to hear from you! I'd love to walk you through a quick demo — how does Thursday at 2pm work for you?"
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => toast.success("Reply sent!")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <Reply className="w-4 h-4" /> Use This Reply
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
                        <Reply className="w-4 h-4" /> Reply Manually
                      </button>
                      <button
                        onClick={handleMarkConverted}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Converted
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default InboxPage;
