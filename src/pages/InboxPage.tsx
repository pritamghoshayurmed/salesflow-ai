import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { Sparkles, CheckCircle2, Reply, Star } from "lucide-react";

const threads = [
  { id: 1, name: "Sarah Chen", company: "Stripe", subject: "Re: Quick question about scaling", preview: "Hi Alex, thanks for reaching out! I'd love to learn more about how you're helping teams...", time: "2h ago", classification: "Interested", unread: true },
  { id: 2, name: "Mike Rodriguez", company: "Notion", subject: "Re: Outbound automation", preview: "Not the right time for us, but happy to revisit in Q2.", time: "4h ago", classification: "Not Interested", unread: false },
  { id: 3, name: "Lisa Park", company: "Linear", subject: "Re: Sales ops at Linear", preview: "Interesting — can you send me a one-pager with pricing?", time: "1d ago", classification: "Interested", unread: true },
  { id: 4, name: "James Liu", company: "Figma", subject: "Re: Meeting request", preview: "Could you share more details on the integration capabilities?", time: "1d ago", classification: "Neutral", unread: false },
  { id: 5, name: "Anna Kim", company: "Vercel", subject: "Re: AI for sales teams", preview: "We already use a similar tool. Thanks though!", time: "2d ago", classification: "Not Interested", unread: false },
];

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
  const [selected, setSelected] = useState(threads[0]);

  return (
    <>
      <TopNavbar title="Inbox" subtitle="Manage replies and conversations" />
      <main className="flex-1 overflow-hidden flex">
        {/* Thread List */}
        <div className="w-full md:w-96 border-r border-border overflow-y-auto">
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              className={`px-4 py-4 border-b border-border cursor-pointer transition-colors ${
                selected.id === t.id ? "bg-primary/5" : "hover:bg-muted/50"
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
              <div className="ml-11 mt-2">
                <span className={classificationBadge(t.classification)}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t.classification}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Thread Detail */}
        <div className="flex-1 hidden md:flex flex-col">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">{selected.subject}</h3>
            <p className="text-sm text-muted-foreground">{selected.name} · {selected.company}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
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
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  <Reply className="w-4 h-4" /> Use This Reply
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
                  <Reply className="w-4 h-4" /> Reply Manually
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
                  <CheckCircle2 className="w-4 h-4" /> Mark Converted
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default InboxPage;
