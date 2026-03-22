import React, { useState } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  scrapeLeadsFromInternet,
  ScrapingPreferences,
  ScrapedLead,
} from "@/lib/api-clients";

interface LeadScrapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsScraped: (leads: ScrapedLead[]) => void;
}

const LeadScrapeModal: React.FC<LeadScrapeModalProps> = ({
  isOpen,
  onClose,
  onLeadsScraped,
}) => {
  const [step, setStep] = useState<"form" | "scraping" | "preview">("form");
  const [preferences, setPreferences] = useState<ScrapingPreferences>({
    industry: "",
    jobTitle: "",
    companySize: "100-500 employees",
    location: "",
    leadsToFind: 10,
  });
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const handleScrape = async () => {
    if (!preferences.industry || !preferences.jobTitle) {
      toast.error("Please fill in industry and job title");
      return;
    }

    setLoading(true);
    setStep("scraping");
    setProgress("Initializing AI agent...");

    try {
      setProgress("Generating search queries...");
      const leads = await scrapeLeadsFromInternet(preferences);

      if (leads.length === 0) {
        toast.error("No leads found. Try different criteria.");
        setStep("form");
        setLoading(false);
        return;
      }

      setScrapedLeads(leads);
      setSelectedLeads(new Set(leads.map((_, i) => i)));
      setStep("preview");
      setProgress("");
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to scrape leads"
      );
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeads = () => {
    const leadsToAdd = scrapedLeads.filter((_, i) => selectedLeads.has(i));
    onLeadsScraped(leadsToAdd);
    toast.success(`Added ${leadsToAdd.length} leads from web scraping!`);
    handleClose();
  };

  const handleClose = () => {
    setStep("form");
    setPreferences({
      industry: "",
      jobTitle: "",
      companySize: "100-500 employees",
      location: "",
      leadsToFind: 10,
    });
    setScrapedLeads([]);
    setSelectedLeads(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-card w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {step === "form"
                ? "Scrape Leads from Internet"
                : step === "scraping"
                ? "Finding Leads..."
                : "Review Scraped Leads"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "form"
                ? "AI will search the internet for leads matching your criteria"
                : step === "scraping"
                ? progress
                : `Found ${scrapedLeads.length} leads - select the ones you want to import`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Step */}
        {step === "form" && (
          <div className="p-6 space-y-4">
            {/* Industry */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Industry / Type *
              </label>
              <input
                type="text"
                placeholder="e.g., SaaS, Tech, Healthcare, Fintech"
                value={preferences.industry}
                onChange={(e) =>
                  setPreferences({ ...preferences, industry: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Job Title / Role *
              </label>
              <input
                type="text"
                placeholder="e.g., VP Sales, Head of Revenue, Sales Director"
                value={preferences.jobTitle}
                onChange={(e) =>
                  setPreferences({ ...preferences, jobTitle: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Company Size */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Company Size
              </label>
              <select
                value={preferences.companySize}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    companySize: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>Startup (1-50)</option>
                <option>Growth (50-200)</option>
                <option>100-500 employees</option>
                <option>500-1000 employees</option>
                <option>Enterprise (1000+)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Location (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., USA, San Francisco, Europe"
                value={preferences.location}
                onChange={(e) =>
                  setPreferences({ ...preferences, location: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Number of Leads */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Leads to Find: <span className="text-primary font-bold">{preferences.leadsToFind}</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={preferences.leadsToFind}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    leadsToFind: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Finding more leads takes longer but gives better results
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScrape}
                disabled={loading || !preferences.industry || !preferences.jobTitle}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  "Start Scraping"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Scraping Step */}
        {step === "scraping" && (
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-foreground font-medium">
              AI agent is searching the internet...
            </p>
            <p className="text-muted-foreground text-sm">{progress}</p>
            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded border border-border">
              This may take 30-60 seconds. Generating search queries, searching
              the web via Serper API, and extracting lead info with AI...
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === "preview" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Found {scrapedLeads.length} leads!
                </p>
                <p className="text-xs text-muted-foreground">
                  Select which ones to add to your lead list
                </p>
              </div>
            </div>

            {/* Leads Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedLeads.size === scrapedLeads.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads(
                              new Set(scrapedLeads.map((_, i) => i))
                            );
                          } else {
                            setSelectedLeads(new Set());
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scrapedLeads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(idx)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedLeads);
                            if (e.target.checked) {
                              newSelected.add(idx);
                            } else {
                              newSelected.delete(idx);
                            }
                            setSelectedLeads(newSelected);
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-foreground">{lead.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {lead.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {lead.company}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {lead.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep("form")}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAddLeads}
                disabled={selectedLeads.size === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Add {selectedLeads.size} Leads
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadScrapeModal;
