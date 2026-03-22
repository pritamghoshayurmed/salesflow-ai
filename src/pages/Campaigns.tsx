import { useMemo, useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import { Plus, Play, Pause, Mail, Clock, ArrowRight, Users, Sparkles, CheckCircle2, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface SequenceStep {
  id: number;
  type: string;
  subject: string;
  delay: string;
}

const Campaigns = () => {
  const { leads, campaigns, addCampaign, launchCampaign, generatePersonalizedEmailForLead } = useSales();
  const [showCreate, setShowCreate] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [campaignName, setCampaignName] = useState("AI Outreach Campaign");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [emailTemplate, setEmailTemplate] = useState(
    `Hi {{first_name}},\n\n{{ai_line}}\n\nWe've helped companies like {{company}} book 3x more meetings with AI-powered personalization.\n\nWorth a quick chat?\n\nBest,\nAlex`
  );
  const [tone, setTone] = useState("Professional");
  const [goal, setGoal] = useState("Book a meeting");
  const [extraContext, setExtraContext] = useState("");
  const [focusLeadId, setFocusLeadId] = useState<number | null>(null);
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewEmail, setPreviewEmail] = useState("");
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([
    { id: 1, type: "Initial Email", subject: "Quick question about scaling sales", delay: "Day 0" },
  ]);

  const selectedLeads = useMemo(
    () => leads.filter((lead) => selectedLeadIds.includes(lead.id)),
    [leads, selectedLeadIds]
  );

  const personalizedCount = useMemo(
    () => selectedLeads.filter((lead) => !!lead.personalizedEmail).length,
    [selectedLeads]
  );

  const steps = [
    { label: "Select Leads", icon: Users },
    { label: "Define ICP", icon: Sparkles },
    { label: "Write Email", icon: Mail },
    { label: "Build Sequence", icon: Clock },
    { label: "AI Personalization", icon: Wand2 },
    { label: "Launch", icon: Play },
  ];

  const addStep = () => {
    const n = sequenceSteps.length;
    setSequenceSteps((prev) => [
      ...prev,
      { id: Date.now(), type: `Follow-up ${n}`, subject: `Re: Following up`, delay: `Day ${n * 3}` },
    ]);
  };

  const removeStep = (id: number) => {
    if (sequenceSteps.length <= 1) return;
    setSequenceSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleLead = (leadId: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleGeneratePersonalization = () => {
    if (!focusLeadId) {
      toast.error("Select a lead first.");
      return;
    }

    const generated = generatePersonalizedEmailForLead({
      leadId: focusLeadId,
      tone,
      goal,
      extraContext,
    });

    if (!generated) {
      toast.error("Unable to generate personalization for this lead.");
      return;
    }

    setPreviewSubject(generated.subject);
    setPreviewEmail(generated.email);
    toast.success("Personalized email generated.");
  };

  const handleLaunch = () => {
    if (selectedLeadIds.length === 0) {
      toast.error("Select at least one lead before launching.");
      return;
    }

    const campaignId = addCampaign(campaignName, selectedLeadIds);
    launchCampaign(campaignId);

    toast.success(`Campaign launched! Emails are being sent to ${selectedLeadIds.length} selected leads.`);
    setShowCreate(false);
    setActiveStep(0);
    setSelectedLeadIds([]);
    setFocusLeadId(null);
    setPreviewSubject("");
    setPreviewEmail("");
  };

  return (
    <>
      <TopNavbar title="Campaigns" subtitle="Manage outreach sequences" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const nextOpen = !showCreate;
              setShowCreate(nextOpen);
              setActiveStep(0);
              if (nextOpen) {
                setSelectedLeadIds(leads.map((lead) => lead.id));
                setFocusLeadId(leads[0]?.id ?? null);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>

        {/* Create Campaign Flow */}
        {showCreate && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-6">Create New Campaign</h3>

            {/* Campaign Name */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground mb-1 block">Campaign Name</label>
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full max-w-md px-4 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

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
                    {i < activeStep ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
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
                  <p className="text-xs text-muted-foreground mb-4">
                    {leads.length > 0
                      ? `You have ${leads.length} leads available from CSV, script, and integration sources.`
                      : "No leads imported yet — go to Leads tab to add leads first."}
                  </p>

                  {leads.length > 0 ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={() => setSelectedLeadIds(leads.map((lead) => lead.id))}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-card transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setSelectedLeadIds([])}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-card transition-colors"
                        >
                          Clear
                        </button>
                        <span className="text-xs text-muted-foreground">{selectedLeadIds.length} selected</span>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {leads.map((lead) => (
                          <label key={lead.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={() => toggleLead(lead.id)}
                              className="h-4 w-4"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.email} · {lead.company}</p>
                            </div>
                            <span className="badge-neutral">{lead.source}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Import leads from the Leads page to continue.</p>
                  )}
                </div>
              )}
              {activeStep === 1 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Define your Ideal Customer Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Job Title (e.g., VP Sales)" defaultValue="VP Sales, CRO, Head of Growth" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                    <input placeholder="Company Size" defaultValue="50-500 employees" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                    <input placeholder="Industry" defaultValue="SaaS, Tech" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                    <input placeholder="Geography" defaultValue="US, Canada" className="px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Email Template</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Use <code className="bg-muted px-1 rounded text-primary">{"{{first_name}}"}</code>, <code className="bg-muted px-1 rounded text-primary">{"{{company}}"}</code>, <code className="bg-muted px-1 rounded text-primary">{"{{ai_line}}"}</code> as variables.
                  </p>
                  <textarea
                    rows={8}
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono text-foreground"
                  />
                </div>
              )}
              {activeStep === 3 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Sequence Builder</h4>
                  <div className="space-y-3">
                    {sequenceSteps.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border relative">
                        {/* Vertical connector */}
                        {i < sequenceSteps.length - 1 && (
                          <div className="absolute left-[28px] top-full w-0.5 h-3 bg-primary/20 z-10" />
                        )}
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {step.type.startsWith("Wait") ? (
                            <Clock className="w-4 h-4 text-primary" />
                          ) : (
                            <Mail className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{step.type}</p>
                          <p className="text-xs text-muted-foreground">{step.subject}</p>
                        </div>
                        <span className="badge-neutral">{step.delay}</span>
                        {sequenceSteps.length > 1 && (
                          <button onClick={() => removeStep(step.id)} className="p-1 hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addStep}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Follow-up Step
                  </button>
                </div>
              )}
              {activeStep === 4 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Generate AI personalization before launch</h4>
                  {selectedLeads.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Select at least one lead in Step 1 first.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Lead</label>
                          <select
                            value={focusLeadId ?? ""}
                            onChange={(e) => setFocusLeadId(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                          >
                            {selectedLeads.map((lead) => (
                              <option key={lead.id} value={lead.id}>
                                {lead.name} ({lead.company})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Tone</label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                          >
                            <option>Professional</option>
                            <option>Friendly</option>
                            <option>Bold</option>
                            <option>Consultative</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Goal</label>
                        <input
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Additional context (optional)</label>
                        <textarea
                          rows={3}
                          value={extraContext}
                          onChange={(e) => setExtraContext(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground"
                        />
                      </div>

                      <button
                        onClick={handleGeneratePersonalization}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Generate Personalized Email
                      </button>

                      {(previewSubject || previewEmail) && (
                        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Subject</p>
                            <p className="text-sm font-medium text-foreground">{previewSubject}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <textarea
                              rows={8}
                              value={previewEmail}
                              onChange={(e) => setPreviewEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground"
                            />
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Personalized: {personalizedCount}/{selectedLeadIds.length} selected leads.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {activeStep === 5 && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">Ready to Launch</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your campaign "{campaignName}" will reach {selectedLeadIds.length} selected leads with {sequenceSteps.length} step{sequenceSteps.length > 1 ? "s" : ""}.
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">{personalizedCount} leads already have personalized emails.</p>
                  <button
                    onClick={handleLaunch}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                  >
                    🚀 Launch Campaign
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
              {activeStep < 4 && (
                <button
                  onClick={() => {
                    if (activeStep === 0 && selectedLeadIds.length === 0) {
                      toast.error("Select at least one lead to continue.");
                      return;
                    }

                    setActiveStep(activeStep + 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Next Step
                </button>
              )}
              {activeStep === 4 && (
                <button
                  onClick={() => setActiveStep(5)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Review Launch
                </button>
              )}
            </div>
          </div>
        )}

        {/* Campaign List */}
        {campaigns.length > 0 && (
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
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className={c.status === "Active" ? "badge-success" : c.status === "Draft" ? "badge-neutral" : "badge-warning"}>
                        {c.status === "Active" ? <Play className="w-3 h-3 mr-1" /> : c.status === "Draft" ? null : <Pause className="w-3 h-3 mr-1" />}
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
        )}

        {campaigns.length === 0 && !showCreate && (
          <div className="glass-card p-12 flex flex-col items-center text-center animate-fade-in">
            <Mail className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground">Create your first outreach campaign to start engaging leads.</p>
          </div>
        )}
      </main>
    </>
  );
};

export default Campaigns;
