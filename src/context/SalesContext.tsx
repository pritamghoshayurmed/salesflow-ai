import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type LeadSource = "CSV" | "Script" | "Integration";

export interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  source: LeadSource;
  status: string;
  lastContacted: string;
  aiLine?: string;
  personalizedSubject?: string;
  personalizedEmail?: string;
}

export interface Campaign {
  id: number;
  name: string;
  status: string;
  leads: number;
  selectedLeadIds: number[];
  replyRate: string;
  openRate: string;
}

export interface InboxThread {
  id: number;
  name: string;
  company: string;
  subject: string;
  preview: string;
  time: string;
  classification: "Interested" | "Not Interested" | "Neutral";
  unread: boolean;
}

export interface ActivityEvent {
  id: number;
  text: string;
  type: "send" | "reply" | "booked" | "enriched" | "campaign";
  time: string;
}

interface Metrics {
  totalLeads: number;
  emailsSent: number;
  replyRate: number;
  meetingsBooked: number;
}

interface SalesContextType {
  leads: Lead[];
  campaigns: Campaign[];
  inbox: InboxThread[];
  metrics: Metrics;
  activityFeed: ActivityEvent[];
  calendarConnected: boolean;
  autoBook: boolean;

  importLeads: () => void;
  importLeadsFromCsv: () => number;
  scrapeLeadsFromScript: () => number;
  importLeadsFromIntegration: () => number;
  enrichLeads: () => Promise<void>;
  addCampaign: (name: string, leadIds: number[]) => number;
  launchCampaign: (id: number) => void;
  generatePersonalizedEmailForLead: (params: {
    leadId: number;
    tone: string;
    goal: string;
    extraContext?: string;
  }) => { subject: string; email: string } | null;
  simulateReply: () => void;
  markConverted: (threadId: number) => void;
  connectCalendar: () => Promise<void>;
  setAutoBook: (v: boolean) => void;
  addActivity: (text: string, type: ActivityEvent["type"]) => void;
}

const SalesContext = createContext<SalesContextType | null>(null);

export const useSales = () => {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error("useSales must be used within SalesProvider");
  return ctx;
};

const MOCK_CSV_LEADS: Omit<Lead, "source">[] = [
  { id: 101, name: "Rachel Torres", email: "rachel@snowflake.com", company: "Snowflake", role: "VP Revenue", status: "New", lastContacted: "Never" },
  { id: 102, name: "Kevin Huang", email: "kevin@datadog.com", company: "Datadog", role: "Head of Sales", status: "New", lastContacted: "Never" },
  { id: 103, name: "Priya Sharma", email: "priya@freshworks.com", company: "Freshworks", role: "Director BDR", status: "New", lastContacted: "Never" },
  { id: 104, name: "Tom Baker", email: "tom@cloudflare.com", company: "Cloudflare", role: "CRO", status: "New", lastContacted: "Never" },
  { id: 105, name: "Mei Lin", email: "mei@retool.com", company: "Retool", role: "GTM Lead", status: "New", lastContacted: "Never" },
];

const MOCK_SCRIPT_LEADS: Omit<Lead, "source">[] = [
  { id: 201, name: "Daniel Park", email: "daniel@atlassian.com", company: "Atlassian", role: "Sales Operations Lead", status: "New", lastContacted: "Never" },
  { id: 202, name: "Sofia Rossi", email: "sofia@canva.com", company: "Canva", role: "Head of Growth", status: "New", lastContacted: "Never" },
  { id: 203, name: "Marcus Lee", email: "marcus@notion.so", company: "Notion", role: "Director of Revenue", status: "New", lastContacted: "Never" },
];

const MOCK_INTEGRATION_LEADS: Omit<Lead, "source">[] = [
  { id: 301, name: "Nadia Ahmed", email: "nadia@hubspot.com", company: "HubSpot", role: "Regional Sales Manager", status: "New", lastContacted: "Never" },
  { id: 302, name: "Oliver Grant", email: "oliver@salesforce.com", company: "Salesforce", role: "Enterprise AE", status: "New", lastContacted: "Never" },
  { id: 303, name: "Elena Diaz", email: "elena@zendesk.com", company: "Zendesk", role: "RevOps Manager", status: "New", lastContacted: "Never" },
];

const AI_LINES: Record<number, string> = {
  101: "Loved your recent keynote on data-driven selling at SaaStr — your insights on pipeline velocity were spot on.",
  102: "Saw Datadog just expanded into APM for sales teams — fascinating move that aligns perfectly with what we do.",
  103: "Your LinkedIn post about scaling BDR teams from 5 to 50 really resonated with our approach.",
  104: "Congrats on Cloudflare's record quarter! Scaling revenue ops at this pace must need serious automation.",
  105: "Noticed Retool is hiring 3 new AEs — sounds like the perfect time to supercharge outbound.",
};

const SIMULATED_REPLIES = [
  { name: "Rachel Torres", company: "Snowflake", subject: "Re: Scaling revenue at Snowflake", preview: "This is really interesting — we've been looking for exactly this kind of solution. Can we set up a 30-min call this week?", classification: "Interested" as const },
  { name: "Kevin Huang", company: "Datadog", subject: "Re: AI-powered outreach", preview: "Thanks for reaching out. I'm intrigued by the personalization angle. Let me loop in our VP of Sales Ops.", classification: "Interested" as const },
  { name: "Tom Baker", company: "Cloudflare", subject: "Re: Quick question", preview: "We're set with our current stack for now, but appreciate the outreach.", classification: "Not Interested" as const },
  { name: "Priya Sharma", company: "Freshworks", subject: "Re: BDR automation", preview: "Interesting timing — we're actually evaluating tools in this space. Could you send pricing?", classification: "Interested" as const },
];

let replyCounter = 0;

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [inbox, setInbox] = useState<InboxThread[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [autoBook, setAutoBookState] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    totalLeads: 0,
    emailsSent: 0,
    replyRate: 0,
    meetingsBooked: 0,
  });

  const addActivity = useCallback((text: string, type: ActivityEvent["type"]) => {
    setActivityFeed((prev) => [
      { id: Date.now() + Math.random(), text, type, time: "Just now" },
      ...prev,
    ].slice(0, 20));
  }, []);

  const appendLeads = useCallback((incoming: Omit<Lead, "source">[], source: LeadSource) => {
    const existing = new Set(leads.map((l) => l.id));
    const newLeads = incoming
      .filter((l) => !existing.has(l.id))
      .map((l) => ({ ...l, source }));

    if (newLeads.length === 0) {
      return 0;
    }

    setLeads((prev) => [...prev, ...newLeads]);
    setMetrics((m) => ({ ...m, totalLeads: m.totalLeads + newLeads.length }));

    return newLeads.length;
  }, [leads]);

  const importLeadsFromCsv = useCallback(() => {
    const added = appendLeads(MOCK_CSV_LEADS, "CSV");
    if (added > 0) {
      addActivity(`Imported ${added} leads from CSV upload`, "send");
    }
    return added;
  }, [addActivity, appendLeads]);

  const scrapeLeadsFromScript = useCallback(() => {
    const added = appendLeads(MOCK_SCRIPT_LEADS, "Script");
    if (added > 0) {
      addActivity(`Scraped ${added} leads from web script`, "send");
    }
    return added;
  }, [addActivity, appendLeads]);

  const importLeadsFromIntegration = useCallback(() => {
    const added = appendLeads(MOCK_INTEGRATION_LEADS, "Integration");
    if (added > 0) {
      addActivity(`Imported ${added} leads from CRM integration`, "send");
    }
    return added;
  }, [addActivity, appendLeads]);

  const importLeads = useCallback(() => importLeadsFromCsv(), [importLeadsFromCsv]);

  const enrichLeads = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 2000));
    setLeads((prev) =>
      prev.map((l) => ({
        ...l,
        aiLine: AI_LINES[l.id] || `Great to connect — saw ${l.company} is doing exciting things in the market.`,
        status: l.status === "New" ? "Enriched" : l.status,
      }))
    );
    addActivity("AI enriched all leads with personalized opening lines", "enriched");
  }, [addActivity]);

  const addCampaign = useCallback((name: string, leadIds: number[]) => {
    const c: Campaign = {
      id: Date.now(),
      name,
      status: "Draft",
      leads: leadIds.length,
      selectedLeadIds: leadIds,
      replyRate: "0%",
      openRate: "0%",
    };
    setCampaigns((prev) => [...prev, c]);
    return c.id;
  }, []);

  const generatePersonalizedEmailForLead = useCallback((params: {
    leadId: number;
    tone: string;
    goal: string;
    extraContext?: string;
  }) => {
    const target = leads.find((lead) => lead.id === params.leadId);
    if (!target) return null;

    const aiLine = target.aiLine || `Noticed the work ${target.company} is doing around modern revenue execution.`;
    const subject = `${target.company}: ${params.goal} with ${params.tone.toLowerCase()} outreach`;
    const email = `Hi ${target.name.split(" ")[0]},\n\n${aiLine}\n\nI wanted to reach out because teams like ${target.company} are using AI-assisted outreach to improve reply rates while keeping messaging personal.\n\nGoal: ${params.goal}. Tone: ${params.tone}.\n${params.extraContext ? `Context to include: ${params.extraContext}\n` : ""}\nWould you be open to a quick 15-minute conversation this week?\n\nBest,\nAlex`;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === params.leadId
          ? {
              ...lead,
              aiLine,
              personalizedSubject: subject,
              personalizedEmail: email,
              status: lead.status === "New" ? "Enriched" : lead.status,
            }
          : lead
      )
    );

    addActivity(`Generated personalized email for ${target.name}`, "enriched");

    return { subject, email };
  }, [addActivity, leads]);

  const launchCampaign = useCallback((id: number) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;

    const selectedIds = new Set(campaign.selectedLeadIds);
    const selectedCount = campaign.selectedLeadIds.length;

    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Active", openRate: "64%", replyRate: "0%" } : c))
    );

    setLeads((prev) =>
      prev.map((l) =>
        selectedIds.has(l.id)
          ? {
              ...l,
              status: "In Sequence",
              lastContacted: "Just now",
            }
          : l
      )
    );

    setMetrics((m) => ({ ...m, emailsSent: m.emailsSent + selectedCount }));
    addActivity(`Campaign launched — ${selectedCount} personalized emails are being sent`, "campaign");

    // Simulate open rate bump
    setTimeout(() => {
      const opened = Math.max(1, Math.round(selectedCount * 0.4));
      addActivity(`${opened} emails opened by prospects`, "send");
    }, 3000);
  }, [addActivity, campaigns]);

  const simulateReply = useCallback(() => {
    const template = SIMULATED_REPLIES[replyCounter % SIMULATED_REPLIES.length];
    replyCounter++;
    const newThread: InboxThread = {
      id: Date.now(),
      ...template,
      time: "Just now",
      unread: true,
    };

    setTimeout(() => {
      setInbox((prev) => [newThread, ...prev]);
      setMetrics((m) => ({
        ...m,
        replyRate: Math.min(100, Math.round(((m.replyRate / 100) * m.emailsSent + 1) / Math.max(1, m.emailsSent) * 100)),
        meetingsBooked: template.classification === "Interested" ? m.meetingsBooked + 1 : m.meetingsBooked,
      }));

      if (template.classification === "Interested") {
        addActivity(`Positive reply from ${template.name} — sequence auto-paused`, "reply");
      } else {
        addActivity(`Reply from ${template.name} (${template.classification})`, "reply");
      }

      // Auto-pause lead
      setLeads((prev) =>
        prev.map((l) =>
          l.name === template.name ? { ...l, status: "Replied" } : l
        )
      );
    }, 1000);
  }, [addActivity]);

  const markConverted = useCallback((threadId: number) => {
    setInbox((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, classification: "Interested" as const, unread: false } : t))
    );
    setMetrics((m) => ({ ...m, meetingsBooked: m.meetingsBooked + 1 }));
    addActivity("Lead marked as converted — meeting booked!", "booked");
  }, [addActivity]);

  const connectCalendar = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1500));
    setCalendarConnected(true);
    addActivity("Google Calendar connected successfully", "booked");
  }, [addActivity]);

  const setAutoBook = useCallback((v: boolean) => {
    setAutoBookState(v);
    if (v) addActivity("Auto-book meetings from positive replies enabled", "booked");
  }, [addActivity]);

  return (
    <SalesContext.Provider
      value={{
        leads, campaigns, inbox, metrics, activityFeed,
        calendarConnected, autoBook,
        importLeads, importLeadsFromCsv, scrapeLeadsFromScript, importLeadsFromIntegration,
        enrichLeads, addCampaign, launchCampaign, generatePersonalizedEmailForLead,
        simulateReply, markConverted, connectCalendar, setAutoBook, addActivity,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};
