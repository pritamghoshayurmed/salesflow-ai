import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { Plus, Play, Pause, Mail, Clock, ArrowRight, Users, Sparkles, CheckCircle2 } from "lucide-react";

const campaignsData = [
  { id: 1, name: "Q1 Enterprise Push", status: "Active", leads: 240, replyRate: "24%", openRate: "68%" },
  { id: 2, name: "Series B Founders", status: "Active", leads: 180, replyRate: "18%", openRate: "54%" },
  { id: 3, name: "VP Sales Outreach", status: "Paused", leads: 320, replyRate: "32%", openRate: "71%" },
  { id: 4, name: "Product-Led Growth", status: "Active", leads: 150, replyRate: "21%", openRate: "62%" },
];

const steps = [
  { label: "Select Leads", icon: Users },
  { label: "Define ICP", icon: Sparkles },
  { label: "Generate Email", icon: Mail },
  { label: "Build Sequence", icon: Clock },
  { label: "Launch", icon: Play },
];

const sequenceSteps = [
  { type: "Email 1", subject: "Quick question about scaling sales", delay: "Day 0" },
  { type: "Follow-up 1", subject: "Re: Quick question — saw your latest post", delay: "Day 3" },
  { type: "Follow-up 2", subject: "Last touch — special offer inside", delay: "Day 7" },
];

const Campaigns = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <>
      <TopNavbar title="Campaigns" subtitle="Manage outreach sequences" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>

        {/* Create Campaign Flow */}
        {showCreate && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-6">Create New Campaign</h3>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStep(i)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      i === activeStep
                        ? "bg-primary text-primary-foreground"
                        : i < activeStep
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < activeStep ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6 rounded-xl bg-muted/50 min-h-[200px]">
              {activeStep === 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Select your target leads</h4>
                  <p className="text-xs text-muted-foreground mb-4">Choose from your existing leads or import new ones.</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-card transition-colors text-foreground">All Leads (967)</button>
                    <button className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-card transition-colors text-foreground">Qualified (234)</button>
                    <button className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-card transition-colors text-foreground">New (412)</button>
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Define your Ideal Customer Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Job Title (e.g., VP Sales)" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input placeholder="Company Size" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input placeholder="Industry" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <input placeholder="Geography" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">AI Email Generator</h4>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    defaultValue={`Hi {{first_name}},\n\nI noticed {{company}} recently raised a Series B — congrats! Many teams at this stage struggle to scale outbound effectively.\n\nWe've helped companies like yours book 3x more meetings with AI-powered personalization.\n\nWorth a quick chat?\n\nBest,\nYour Name`}
                  />
                  <button className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-4 h-4" /> Regenerate with AI
                  </button>
                </div>
              )}
              {activeStep === 3 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Sequence Builder</h4>
                  <div className="space-y-3">
                    {sequenceSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{step.type}</p>
                          <p className="text-xs text-muted-foreground">{step.subject}</p>
                        </div>
                        <span className="badge-neutral">{step.delay}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeStep === 4 && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">Ready to Launch</h4>
                  <p className="text-sm text-muted-foreground mb-6">Your campaign will reach 240 leads over 7 days.</p>
                  <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                    Launch Campaign
                  </button>
                </div>
              )}
            </div>

            {/* Nav */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Campaign List */}
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Campaign</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Leads</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Open Rate</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Reply Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaignsData.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={c.status === "Active" ? "badge-success" : "badge-warning"}>
                      {c.status === "Active" ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{c.leads}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{c.openRate}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{c.replyRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Campaigns;
