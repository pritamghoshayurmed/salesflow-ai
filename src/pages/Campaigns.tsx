import { useMemo, useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import { Plus, Play, Mail, Clock, ArrowRight, Users, CheckCircle2, Trash2, Wand2, Zap, Brain } from "lucide-react";
import { toast } from "sonner";

interface SequenceStep {
  id: number;
  type: string;
  subject: string;
  delay: string;
}

const Campaigns = () => {
  const { leads, campaigns, addCampaign, launchCampaign, generatePersonalizedEmailForLead, generatePersonalizedEmailWithResearch } = useSales();
  
  // UI State
  const [showCreate, setShowCreate] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Campaign Config
  const [campaignName, setCampaignName] = useState("AI Outreach Campaign");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  
  // Email & Personalization
  const [tone, setTone] = useState("Professional");
  const [goal, setGoal] = useState("Book a meeting");
  const [focusLeadId, setFocusLeadId] = useState<number | null>(null);
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewEmail, setPreviewEmail] = useState("");
  const [previewHook, setPreviewHook] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateMethod, setGenerateMethod] = useState<"research" | "basic">("research");
  
  // Sequence Config with unique ID counter
  const [nextStepId, setNextStepId] = useState(3);
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([
    { id: 0, type: "Initial Email", subject: "Quick question", delay: "Day 0" },
    { id: 1, type: "Follow-up 1", subject: "Following up", delay: "Day 3" },
  ]);

  // ICP Filtering
  const [icpFilters, setIcpFilters] = useState({
    jobTitles: ["VP Sales", "CRO", "Head of Growth"],
    companySize: "50-500",
    industries: ["SaaS", "Tech"],
  });

  // Computed values
  const selectedLeads = useMemo(
    () => leads.filter((lead) => selectedLeadIds.includes(lead.id)),
    [leads, selectedLeadIds]
  );

  const personalizedCount = useMemo(
    () => selectedLeads.filter((lead) => !!lead.personalizedEmail).length,
    [selectedLeads]
  );

  // Improved step definitions
  const steps = [
    { label: "Select & Filter Leads", icon: Users },
    { label: "Compose Emails", icon: Mail },
    { label: "Build Sequence", icon: Clock },
    { label: "Review & Launch", icon: Play },
  ];

  // Handlers
  const toggleLead = (leadId: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleGenerateEmail = async () => {
    if (!focusLeadId) {
      toast.error("Select a lead first");
      return;
    }

    setGenerating(true);
    try {
      if (generateMethod === "research") {
        // Use AI research-based generation
        const result = await generatePersonalizedEmailWithResearch({
          leadId: focusLeadId,
          tone,
          goal,
        });

        if (result) {
          setPreviewSubject(result.subject);
          setPreviewEmail(result.email);
          setPreviewHook(result.hook);
          toast.success("Email generated with company research!");
        } else {
          toast.error("Failed to generate email");
        }
      } else {
        // Use basic generation
        const result = await generatePersonalizedEmailForLead({
          leadId: focusLeadId,
          tone,
          goal,
        });

        if (result) {
          setPreviewSubject(result.subject);
          setPreviewEmail(result.email);
          toast.success("Email generated!");
        } else {
          toast.error("Failed to generate email");
        }
      }
    } catch (error) {
      console.error("Email generation failed:", error);
      toast.error("Email generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const addStep = () => {
    const n = sequenceSteps.length;
    const newStepId = nextStepId;
    setSequenceSteps((prev) => [
      ...prev,
      { id: newStepId, type: `Follow-up ${n}`, subject: `Re: Following up`, delay: `Day ${n * 3}` },
    ]);
    setNextStepId(newStepId + 1);
  };

  const removeStep = (id: number) => {
    if (sequenceSteps.length <= 1) return;
    setSequenceSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLaunch = () => {
    if (selectedLeadIds.length === 0) {
      toast.error("Select at least one lead before launching");
      return;
    }

    if (!previewSubject || !previewEmail) {
      toast.error("Generate an email before launching");
      return;
    }

    const campaignId = addCampaign(campaignName, selectedLeadIds);
    launchCampaign(campaignId);

    toast.success(`Campaign launched! Emails being sent to ${selectedLeadIds.length} leads.`);
    setShowCreate(false);
    setActiveStep(0);
    setSelectedLeadIds([]);
    setFocusLeadId(null);
    setPreviewSubject("");
    setPreviewEmail("");
    setPreviewHook("");
  };

  return (
    <>
      <TopNavbar title="Campaigns" subtitle="Manage outreach sequences" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Create Campaign Button */}
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
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>

        {/* Create Campaign Flow */}
        {showCreate && (
          <div className="glass-card p-6 animate-fade-in space-y-6">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-medium">Campaign Name</label>
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full max-w-md px-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                placeholder="e.g., Q1 VP Sales Outreach"
              />
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setActiveStep(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      i === activeStep
                        ? "bg-primary text-primary-foreground"
                        : i < activeStep
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < activeStep ? <CheckCircle2 className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                    {s.label}
                  </button>
                  {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6 rounded-xl bg-muted/50 space-y-4">
              {/* Step 0: Select & Filter Leads */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Select Leads</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      {leads.length > 0
                        ? `${leads.length} leads available • ${selectedLeadIds.length} selected`
                        : "No leads imported yet"}
                    </p>
                  </div>

                  {leads.length > 0 && (
                    <>
                      {/* ICP Filters (Optional) */}
                      <div className="bg-card p-4 rounded-lg border border-border space-y-3">
                        <p className="text-xs font-medium text-foreground">Filter by ICP (Optional)</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            placeholder="Job titles (comma separated)"
                            defaultValue={icpFilters.jobTitles.join(", ")}
                            className="px-3 py-2 rounded-lg border border-border bg-muted text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                          />
                          <input
                            placeholder="Company size range"
                            defaultValue={icpFilters.companySize}
                            className="px-3 py-2 rounded-lg border border-border bg-muted text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                          />
                          <input
                            placeholder="Industries (comma separated)"
                            defaultValue={icpFilters.industries.join(", ")}
                            className="px-3 py-2 rounded-lg border border-border bg-muted text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                          />
                        </div>
                      </div>

                      {/* Lead Selection */}
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={() => setSelectedLeadIds(leads.map((l) => l.id))}
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
                        <span className="text-xs text-muted-foreground ml-auto">{selectedLeadIds.length} selected</span>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {leads.map((lead) => (
                          <label key={lead.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-card/80 transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={() => toggleLead(lead.id)}
                              className="h-4 w-4"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.email} · {lead.company} · {lead.role}</p>
                            </div>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">{lead.source}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 1: Compose Emails */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Compose Personalized Emails</h4>

                  {selectedLeads.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Select at least one lead in Step 1 first</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Email Configuration */}
                      <div className="bg-card p-4 rounded-lg border border-border space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Lead</label>
                            <select
                              value={focusLeadId ?? ""}
                              onChange={(e) => setFocusLeadId(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                            >
                              {selectedLeads.map((lead) => (
                                <option key={lead.id} value={lead.id}>
                                  {lead.name} ({lead.company})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tone</label>
                            <select
                              value={tone}
                              onChange={(e) => setTone(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                            >
                              <option>Professional</option>
                              <option>Friendly</option>
                              <option>Bold</option>
                              <option>Consultative</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Goal</label>
                          <input
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                            placeholder="e.g., Book a 30-min call"
                          />
                        </div>
                      </div>

                      {/* Generation Methods */}
                      <div className="bg-card p-4 rounded-lg border border-border">
                        <p className="text-xs font-medium text-foreground mb-3">Generate with:</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setGenerateMethod("research")}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              generateMethod === "research"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Brain className="w-3 h-3" />
                            AI Research <span className="text-xs">(Slower, Better)</span>
                          </button>
                          <button
                            onClick={() => setGenerateMethod("basic")}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              generateMethod === "basic"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                            Basic <span className="text-xs">(Fast)</span>
                          </button>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={handleGenerateEmail}
                        disabled={generating || !focusLeadId}
                        className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                      >
                        {generating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Generate Email
                          </>
                        )}
                      </button>

                      {/* Email Preview */}
                      {(previewSubject || previewEmail) && (
                        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
                          {previewHook && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Hook</p>
                              <p className="text-sm text-foreground italic">{previewHook}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                            <p className="text-sm font-medium text-foreground">{previewSubject}</p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Email Body</p>
                            <textarea
                              value={previewEmail}
                              onChange={(e) => setPreviewEmail(e.target.value)}
                              rows={6}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground"
                            />
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {personalizedCount}/{selectedLeadIds.length} leads personalized
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Build Sequence */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Email Sequence</h4>
                  <p className="text-xs text-muted-foreground">Add follow-ups to maximize response rates</p>

                  <div className="space-y-3">
                    {sequenceSteps.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                        {i < sequenceSteps.length - 1 && (
                          <div className="absolute left-[32px] top-full w-0.5 h-3 bg-primary/20" />
                        )}
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{step.type}</p>
                          <p className="text-xs text-muted-foreground">{step.subject}</p>
                        </div>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{step.delay}</span>
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Follow-up
                  </button>
                </div>
              )}

              {/* Step 3: Review & Launch */}
              {activeStep === 3 && (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-2">Ready to Launch</h4>
                    <p className="text-sm text-muted-foreground">
                      Campaign: <span className="font-medium text-foreground">"{campaignName}"</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedLeadIds.length} leads with {sequenceSteps.length} email steps
                    </p>
                  </div>

                  <div className="bg-card p-4 rounded-lg border border-border text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Campaign Name:</span>
                      <span className="text-sm font-medium text-foreground">{campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Total Leads:</span>
                      <span className="text-sm font-medium text-foreground">{selectedLeadIds.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Sequence Steps:</span>
                      <span className="text-sm font-medium text-foreground">{sequenceSteps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Personalized Emails:</span>
                      <span className="text-sm font-medium text-primary">{personalizedCount}/{selectedLeadIds.length}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunch}
                    className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Launch Campaign
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                ← Back
              </button>

              <button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Existing Campaigns List */}
        {campaigns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Active Campaigns ({campaigns.length})</h3>
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">{campaign.leads} leads • {campaign.status} • {campaign.openRate} open rate</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${campaign.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Campaigns;
