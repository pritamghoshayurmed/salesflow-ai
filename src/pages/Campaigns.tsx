import { useMemo, useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import {
  Plus, Play, Mail, Clock, ArrowRight, Users, CheckCircle2, Trash2,
  Wand2, Zap, Brain, ChevronDown, ChevronUp, BarChart2, Send,
  Pause, Eye, Settings2, X, Sparkles, Target, TrendingUp, AlertCircle,
  Edit3, Copy, MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

interface SequenceStep {
  id: number;
  type: string;
  subject: string;
  delay: string;
  body?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-600 border border-emerald-200",
  Draft: "bg-amber-500/10 text-amber-600 border border-amber-200",
  Paused: "bg-slate-200 text-slate-600 border border-slate-300",
  Completed: "bg-blue-500/10 text-blue-600 border border-blue-200",
};

const CampaignCard = ({
  campaign,
  onClick,
}: {
  campaign: ReturnType<typeof useSales>["campaigns"][number];
  onClick: () => void;
}) => {
  const progress = Math.round(
    (parseInt(campaign.openRate) / 100) * campaign.leads
  );

  return (
    <div
      onClick={onClick}
      className="glass-card p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {campaign.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {campaign.leads} leads enrolled
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status] || STATUS_COLORS.Draft}`}
          >
            {campaign.status}
          </span>
          <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Open Rate", value: campaign.openRate, icon: Eye, color: "text-blue-500" },
          { label: "Reply Rate", value: campaign.replyRate, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Leads", value: campaign.leads, icon: Users, color: "text-violet-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-muted/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3 h-3 ${color}`} />
              <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {campaign.status === "Active" && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Engagement progress</span>
            <span>{progress}/{campaign.leads} opened</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: campaign.openRate }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Campaigns = () => {
  const { leads, campaigns, addCampaign, launchCampaign, generatePersonalizedEmailForLead, generatePersonalizedEmailWithResearch } = useSales();

  // UI State
  const [showCreate, setShowCreate] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

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

  // Sequence Config
  const [nextStepId, setNextStepId] = useState(3);
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([
    { id: 0, type: "Initial Email", subject: "Quick question about {{company}}", delay: "Day 0", body: "Hi {{first_name}},\n\n{{ai_opener}}\n\nWould love to show you how we can help.\n\nBest,\nAlex" },
    { id: 1, type: "Follow-up 1", subject: "Following up", delay: "Day 3", body: "Hi {{first_name}},\n\nJust wanted to follow up on my previous message...\n\nBest,\nAlex" },
    { id: 2, type: "Follow-up 2", subject: "Last touch", delay: "Day 7", body: "Hi {{first_name}},\n\nI know timing isn't always right — feel free to reach out whenever...\n\nBest,\nAlex" },
  ]);
  const [editingStepId, setEditingStepId] = useState<number | null>(null);

  // Search/filter
  const [leadSearch, setLeadSearch] = useState("");

  const filteredLeads = useMemo(() => {
    if (!leadSearch) return leads;
    const q = leadSearch.toLowerCase();
    return leads.filter(
      (l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.role.toLowerCase().includes(q)
    );
  }, [leads, leadSearch]);

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
    { label: "Compose Emails", icon: Mail },
    { label: "Build Sequence", icon: Clock },
    { label: "Review & Launch", icon: Play },
  ];

  const toggleLead = (leadId: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleGenerateEmail = async () => {
    if (!focusLeadId) { toast.error("Select a lead first"); return; }
    setGenerating(true);
    try {
      if (generateMethod === "research") {
        const result = await generatePersonalizedEmailWithResearch({ leadId: focusLeadId, tone, goal });
        if (result) {
          setPreviewSubject(result.subject);
          setPreviewEmail(result.email);
          setPreviewHook(result.hook);
          toast.success("Email generated with AI research!");
        } else { toast.error("Failed to generate email"); }
      } else {
        const result = await generatePersonalizedEmailForLead({ leadId: focusLeadId, tone, goal });
        if (result) {
          setPreviewSubject(result.subject);
          setPreviewEmail(result.email);
          toast.success("Email generated!");
        } else { toast.error("Failed to generate email"); }
      }
    } catch {
      toast.error("Email generation failed");
    } finally { setGenerating(false); }
  };

  const addStep = () => {
    const n = sequenceSteps.length;
    const newStepId = nextStepId;
    setSequenceSteps((prev) => [
      ...prev,
      { id: newStepId, type: `Follow-up ${n}`, subject: `Re: Following up`, delay: `Day ${n * 4}`, body: "" },
    ]);
    setNextStepId(newStepId + 1);
  };

  const removeStep = (id: number) => {
    if (sequenceSteps.length <= 1) return;
    setSequenceSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStep = (id: number, field: keyof SequenceStep, value: string) => {
    setSequenceSteps((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleLaunch = () => {
    if (selectedLeadIds.length === 0) { toast.error("Select at least one lead before launching"); return; }
    if (!previewSubject || !previewEmail) { toast.error("Generate an email preview before launching"); return; }
    const campaignId = addCampaign(campaignName, selectedLeadIds);
    launchCampaign(campaignId);
    toast.success(`🚀 Campaign launched! ${selectedLeadIds.length} personalized emails are being sent.`);
    setShowCreate(false);
    setActiveStep(0);
    setSelectedLeadIds([]);
    setFocusLeadId(null);
    setPreviewSubject("");
    setPreviewEmail("");
    setPreviewHook("");
    setCampaignName("AI Outreach Campaign");
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "Active");
  const draftCampaigns = campaigns.filter((c) => c.status === "Draft");

  return (
    <>
      <TopNavbar title="Campaigns" subtitle="Create and manage AI-powered outreach sequences" />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {!showCreate && (
              <>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{activeCampaigns.length}</span> active
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{campaigns.reduce((s, c) => s + c.leads, 0)}</span> leads enrolled
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => {
              const nextOpen = !showCreate;
              setShowCreate(nextOpen);
              setActiveStep(0);
              if (nextOpen) {
                setSelectedLeadIds(leads.map((l) => l.id));
                setFocusLeadId(leads[0]?.id ?? null);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showCreate
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
            }`}
          >
            {showCreate ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Campaign</>}
          </button>
        </div>

        {/* Create Campaign Flow */}
        {showCreate && (
          <div className="glass-card p-6 mb-6 animate-fade-in">
            {/* Campaign name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Campaign Name</label>
                <input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full max-w-lg px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-medium"
                  placeholder="e.g., Q1 VP Sales Outreach"
                />
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI-powered personalization enabled
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-1">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => setActiveStep(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      i === activeStep
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : i < activeStep
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {i < activeStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <s.icon className="w-3.5 h-3.5" />
                    )}
                    {s.label}
                  </button>
                  {i < steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 0: Select Leads ── */}
            {activeStep === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Select Target Leads</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {leads.length > 0
                        ? `${leads.length} leads available · ${selectedLeadIds.length} selected`
                        : "No leads imported yet — go to Leads section first"}
                    </p>
                  </div>
                  {leads.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedLeadIds(leads.map((l) => l.id))}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedLeadIds([])}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors text-muted-foreground"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {leads.length > 0 && (
                  <>
                    <input
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Search leads by name, company or role..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    />

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {filteredLeads.map((lead) => (
                        <label
                          key={lead.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedLeadIds.includes(lead.id)
                              ? "border-primary/30 bg-primary/5"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(lead.id)}
                            onChange={() => toggleLead(lead.id)}
                            className="h-4 w-4 accent-primary"
                          />
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {lead.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{lead.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{lead.role} · {lead.company}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {lead.personalizedEmail && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">AI Ready</span>
                            )}
                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{lead.source}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Step 1: Compose Emails ── */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">AI Email Personalization</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Generate hyper-personalized emails for each lead using AI
                  </p>
                </div>

                {selectedLeads.length === 0 ? (
                  <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-800">No leads selected</p>
                    <p className="text-xs text-amber-600 mt-1">Go back to Step 1 and select some leads</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Config Panel */}
                    <div className="space-y-4">
                      <div className="bg-card p-4 rounded-xl border border-border space-y-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Lead to Preview</label>
                          <select
                            value={focusLeadId ?? ""}
                            onChange={(e) => setFocusLeadId(Number(e.target.value))}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                          >
                            {selectedLeads.map((lead) => (
                              <option key={lead.id} value={lead.id}>
                                {lead.name} — {lead.company}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tone</label>
                            <select
                              value={tone}
                              onChange={(e) => setTone(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                            >
                              <option>Professional</option>
                              <option>Friendly</option>
                              <option>Bold</option>
                              <option>Consultative</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Goal</label>
                            <input
                              value={goal}
                              onChange={(e) => setGoal(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                              placeholder="e.g., Book a 30-min demo"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Generation Method */}
                      <div className="bg-card p-4 rounded-xl border border-border">
                        <p className="text-xs font-semibold text-foreground mb-3">Generation Mode</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: "research", label: "AI Research", sub: "Slower, Better", icon: Brain },
                            { key: "basic", label: "Quick Generate", sub: "Fast", icon: Zap },
                          ].map(({ key, label, sub, icon: Icon }) => (
                            <button
                              key={key}
                              onClick={() => setGenerateMethod(key as "research" | "basic")}
                              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-medium transition-all border ${
                                generateMethod === key
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-muted text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{label}</span>
                              <span className="opacity-70 text-[10px]">{sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateEmail}
                        disabled={generating || !focusLeadId}
                        className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-sm"
                      >
                        {generating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Generating with AI...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Generate Personalized Email
                          </>
                        )}
                      </button>

                      <p className="text-xs text-muted-foreground text-center">
                        <span className="font-semibold text-foreground">{personalizedCount}</span> / {selectedLeadIds.length} leads personalized
                      </p>
                    </div>

                    {/* Preview Panel */}
                    <div className="space-y-3">
                      {previewHook && (
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                            <span className="text-xs font-semibold text-violet-700">AI Hook / Opener</span>
                          </div>
                          <p className="text-xs text-violet-800 italic leading-relaxed">{previewHook}</p>
                        </div>
                      )}

                      {previewSubject && (
                        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Subject Line</p>
                            <p className="text-sm font-semibold text-foreground">{previewSubject}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Email Body</p>
                            <textarea
                              value={previewEmail}
                              onChange={(e) => setPreviewEmail(e.target.value)}
                              rows={8}
                              className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground leading-relaxed"
                            />
                          </div>
                        </div>
                      )}

                      {!previewSubject && !previewEmail && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/30 rounded-xl border border-dashed border-border">
                          <Mail className="w-10 h-10 text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground font-medium">Email preview will appear here</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Click "Generate" to create a personalized email</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Build Sequence ── */}
            {activeStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Email Sequence Builder</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define multi-step outreach with timed follow-ups · Sequences auto-stop on reply
                    </p>
                  </div>
                  <button
                    onClick={addStep}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>

                <div className="relative space-y-0">
                  {sequenceSteps.map((step, i) => (
                    <div key={step.id} className="relative flex gap-4">
                      {/* Timeline connector */}
                      {i < sequenceSteps.length - 1 && (
                        <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-border z-0" />
                      )}

                      {/* Step number */}
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary z-10 mt-2 border border-primary/20">
                        {i + 1}
                      </div>

                      {/* Step card */}
                      <div className="flex-1 mb-4">
                        <div className="bg-card border border-border rounded-xl p-4">
                          {editingStepId === step.id ? (
                            <div className="space-y-3">
                              <input
                                value={step.type}
                                onChange={(e) => updateStep(step.id, "type", e.target.value)}
                                placeholder="Step type (e.g., Initial Email)"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                              />
                              <input
                                value={step.subject}
                                onChange={(e) => updateStep(step.id, "subject", e.target.value)}
                                placeholder="Subject line"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                              />
                              <input
                                value={step.delay}
                                onChange={(e) => updateStep(step.id, "delay", e.target.value)}
                                placeholder="Send delay (e.g., Day 3)"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                              />
                              <textarea
                                value={step.body || ""}
                                onChange={(e) => updateStep(step.id, "body", e.target.value)}
                                placeholder="Email body (use {{first_name}}, {{company}}, {{ai_opener}})"
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground"
                              />
                              <button
                                onClick={() => setEditingStepId(null)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                              >
                                Done
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-foreground">{step.type}</p>
                                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{step.delay}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">📧 {step.subject}</p>
                                {step.body && (
                                  <p className="text-xs text-muted-foreground/60 mt-1 truncate">{step.body.substring(0, 80)}...</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => setEditingStepId(step.id)}
                                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                {sequenceSteps.length > 1 && (
                                  <button
                                    onClick={() => removeStep(step.id)}
                                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Auto-stop on Reply</p>
                    <p className="text-xs text-amber-700 mt-0.5">The sequence will automatically stop for any lead that replies, preventing unwanted follow-ups.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Review & Launch ── */}
            {activeStep === 3 && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left — Summary */}
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-lg font-bold text-foreground mb-1">Ready to Launch</h4>
                      <p className="text-sm text-muted-foreground">"{campaignName}"</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                      {[
                        { label: "Campaign Name", value: campaignName },
                        { label: "Total Leads", value: `${selectedLeadIds.length} leads` },
                        { label: "Sequence Steps", value: `${sequenceSteps.length} emails` },
                        { label: "AI Personalized", value: `${personalizedCount}/${selectedLeadIds.length}`, highlight: true },
                        { label: "Tone", value: tone },
                        { label: "Goal", value: goal },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className="flex items-center justify-between px-4 py-3">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className={`text-sm font-medium ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — Sequence preview */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-foreground">Sequence Preview</h5>
                    <div className="space-y-3">
                      {sequenceSteps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{step.type}</p>
                            <p className="text-xs text-muted-foreground truncate">{step.subject}</p>
                          </div>
                          <span className="text-[10px] bg-card border border-border px-2 py-0.5 rounded-full text-muted-foreground font-medium flex-shrink-0">
                            {step.delay}
                          </span>
                        </div>
                      ))}
                    </div>

                    {(selectedLeadIds.length === 0 || !previewSubject) && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            {selectedLeadIds.length === 0 && (
                              <p className="text-xs text-amber-700">⚠ No leads selected (Step 1)</p>
                            )}
                            {!previewSubject && (
                              <p className="text-xs text-amber-700">⚠ No email generated (Step 2)</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleLaunch}
                      disabled={selectedLeadIds.length === 0 || !previewSubject || !previewEmail}
                      className="w-full px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Send className="w-4 h-4" />
                      Launch Campaign · {selectedLeadIds.length} leads
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-2 border-t border-border">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors border border-transparent hover:border-border"
              >
                ← Back
              </button>
              {activeStep < steps.length - 1 && (
                <button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats Overview (if campaigns exist) */}
        {campaigns.length > 0 && !showCreate && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Campaigns", value: campaigns.length, icon: BarChart2, color: "from-blue-500/10 to-blue-500/5 text-blue-600" },
              { label: "Active Now", value: activeCampaigns.length, icon: Play, color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600" },
              { label: "Leads Enrolled", value: campaigns.reduce((s, c) => s + c.leads, 0), icon: Users, color: "from-violet-500/10 to-violet-500/5 text-violet-600" },
              { label: "Avg Reply Rate", value: campaigns.length > 0 ? campaigns.reduce((s, c) => s + parseInt(c.replyRate || "0"), 0) / campaigns.length + "%" : "—", icon: TrendingUp, color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`glass-card p-4 bg-gradient-to-br ${color.split(" ").slice(0, 2).join(" ")}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color.split(" ")[2]}`} />
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Campaign List */}
        {campaigns.length > 0 && !showCreate && (
          <div className="space-y-6">
            {activeCampaigns.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Campaigns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {activeCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} onClick={() => setSelectedCampaign(campaign.id)} />
                  ))}
                </div>
              </div>
            )}
            {draftCampaigns.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Draft Campaigns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {draftCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} onClick={() => setSelectedCampaign(campaign.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {campaigns.length === 0 && !showCreate && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Create your first AI-powered outreach campaign. Import leads, personalize emails with AI, and launch multi-step sequences.
            </p>
            <button
              onClick={() => { setShowCreate(true); setActiveStep(0); if (leads.length > 0) { setSelectedLeadIds(leads.map((l) => l.id)); setFocusLeadId(leads[0]?.id ?? null); } }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Your First Campaign
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export default Campaigns;
