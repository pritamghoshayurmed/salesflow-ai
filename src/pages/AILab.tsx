import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react";

const AILab = () => {
  const [leadInput, setLeadInput] = useState("Sarah Chen, VP Sales at Stripe. Recently raised Series B. Posted about scaling outbound.");
  const [generatedSubject, setGeneratedSubject] = useState("Quick question about Stripe's outbound strategy");
  const [generatedEmail, setGeneratedEmail] = useState(
    `Hi Sarah,\n\nCongrats on Stripe's Series B — exciting times! I noticed your recent post about scaling sales operations, and it resonated with a challenge many fast-growing teams face.\n\nWe've helped companies at a similar stage book 3x more meetings using AI-personalized outreach — without adding headcount.\n\nWould you be open to a 15-min chat this week to see if it's a fit?\n\nBest,\nAlex`
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <TopNavbar title="AI Lab" subtitle="Generate personalized outreach" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
          {/* Input */}
          <div className="space-y-6">
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-sm font-semibold text-foreground mb-1">Lead Context</h3>
              <p className="text-xs text-muted-foreground mb-4">Paste lead info for AI-powered personalization.</p>
              <textarea
                rows={6}
                value={leadInput}
                onChange={(e) => setLeadInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground"
              />
            </div>

            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
              <h3 className="text-sm font-semibold text-foreground mb-4">Prompt Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tone</label>
                  <select className="w-full px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Bold</option>
                    <option>Friendly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Goal</label>
                  <select className="w-full px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                    <option>Book a meeting</option>
                    <option>Start a conversation</option>
                    <option>Share a resource</option>
                  </select>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Sparkles className="w-4 h-4" /> Generate Email
                </button>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-6">
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Generated Subject</h3>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm font-medium text-foreground">{generatedSubject}</p>
              </div>
            </div>

            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Generated Email</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <textarea
                rows={12}
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed text-foreground"
              />
              <div className="flex gap-3 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-4 h-4" /> Regenerate Variation
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AILab;
