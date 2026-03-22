import { useState, useCallback, useRef } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import { Upload, Sparkles, X, Mail, Building, Briefcase, Clock, FileUp, Users, Zap, Plug, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import LeadScrapeModal from "@/components/LeadScrapeModal";
import type { ScrapedLead } from "@/lib/api-clients";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Qualified: "badge-success",
    Contacted: "badge-info",
    New: "badge-neutral",
    Replied: "badge-warning",
    Enriched: "badge-info",
    "In Sequence": "badge-success",
  };
  return map[status] || "badge-neutral";
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

const Leads = () => {
  const { leads, importLeadsFromCsv, importLeadsFromCSVFile, importLeadsFromIntegration, addLeadFromScrap, clearAllLeads, downloadLeadsAsCSV } = useSales();
  const [selectedLead, setSelectedLead] = useState<typeof leads[0] | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(() => {
    const added = importLeadsFromCsv();
    setShowUpload(false);
    if (added > 0) {
      toast.success(`${added} demo leads imported!`);
      return;
    }
    toast.info("All demo leads are already imported.");
  }, [importLeadsFromCsv]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    setUploading(true);
    try {
      const added = await importLeadsFromCSVFile(file);
      setShowUpload(false);
      if (added > 0) {
        toast.success(`✅ Imported ${added} leads from CSV!`);
      } else {
        toast.info("No new leads to import (duplicates skipped)");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import CSV");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [importLeadsFromCSVFile]);

  const handleScrapedLeads = useCallback((scrapedLeads: ScrapedLead[]) => {
    scrapedLeads.forEach((lead) => {
      addLeadFromScrap(lead);
    });
    setShowScrapeModal(false);
    toast.success(`✨ Added ${scrapedLeads.length} leads from web scraping!`);
  }, [addLeadFromScrap]);

  const handleFindLeadsFromIntegration = useCallback(() => {
    const added = importLeadsFromIntegration();
    if (added > 0) {
      toast.success(`${added} leads imported from integration.`);
      return;
    }
    toast.info("No new leads found from integration.");
  }, [importLeadsFromIntegration]);

  const handleClearLeads = useCallback(() => {
    if (leads.length === 0) {
      toast.info("No leads to clear");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${leads.length} leads? This action cannot be undone.`
    );
    if (confirmed) {
      clearAllLeads();
      toast.success("All leads cleared!");
    }
  }, [leads.length, clearAllLeads]);

  const handleDownload = useCallback(() => {
    if (leads.length === 0) {
      toast.info("No leads to download");
      return;
    }
    downloadLeadsAsCSV();
    toast.success(`Downloaded ${leads.length} leads as CSV`);
  }, [leads, downloadLeadsAsCSV]);

  return (
    <>
      <TopNavbar title="Leads" subtitle="Manage your sales pipeline" />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Actions and Stats */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground"
              >
                <Upload className="w-4 h-4" /> Upload CSV
              </button>
              <button
                onClick={() => setShowScrapeModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Zap className="w-4 h-4" />
                Scrape Leads
              </button>
              <button
                onClick={handleFindLeadsFromIntegration}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plug className="w-4 h-4" />
                Integration
              </button>

              {leads.length > 0 && (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground ml-auto"
                  >
                    <Download className="w-4 h-4" /> Download CSV
                  </button>
                  <button
                    onClick={handleClearLeads}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive text-sm font-medium hover:bg-destructive/10 transition-colors text-destructive"
                  >
                    <Trash2 className="w-4 h-4" /> Clear All
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            {leads.length > 0 && (
              <div className="glass-card p-4 flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Leads</p>
                  <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <p className="text-sm text-foreground">
                    {Array.from(new Set(leads.map((l) => l.source))).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stored In</p>
                  <p className="text-sm text-foreground">📦 Browser Storage</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowUpload(false)}>
              <div className="glass-card p-8 max-w-md w-full mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-foreground mb-2">Import Leads</h3>
                <p className="text-sm text-muted-foreground mb-6">Upload a CSV file with columns: Name, Email, Company, Role</p>

                {/* Demo Data Option */}
                <button
                  onClick={handleImport}
                  className="w-full border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all mb-4"
                >
                  <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Load Demo Leads</p>
                  <p className="text-xs text-muted-foreground mt-1">5 sample leads for testing</p>
                </button>

                <p className="text-xs text-muted-foreground text-center mb-4">or</p>

                {/* File Upload */}
                <label className="w-full border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all block">
                  <FileUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Click to upload CSV</p>
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setShowUpload(false)}
                  className="mt-4 w-full px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors text-foreground"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Lead Scrape Modal */}
          <LeadScrapeModal
            isOpen={showScrapeModal}
            onClose={() => setShowScrapeModal(false)}
            onLeadsScraped={handleScrapedLeads}
          />

          {/* Empty state */}
          {leads.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-fade-in">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No leads yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Upload a CSV file to import leads and start building personalized outreach campaigns.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Upload className="w-4 h-4" /> Import Your First Leads
              </button>
            </div>
          ) : (
            /* Table */
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Email</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Company</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Role</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Source</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                    {leads.some((l) => l.aiLine) && (
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">AI Line</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {initials(lead.name)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{lead.email}</td>
                      <td className="px-4 py-3 text-sm text-foreground hidden lg:table-cell">{lead.company}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{lead.role}</td>
                      <td className="px-4 py-3 hidden xl:table-cell"><span className="badge-neutral">{lead.source}</span></td>
                      <td className="px-4 py-3"><span className={statusBadge(lead.status)}>{lead.status}</span></td>
                      {leads.some((l) => l.aiLine) && (
                        <td className="px-4 py-3 hidden xl:table-cell">
                          {lead.aiLine ? (
                            <span className="text-xs text-muted-foreground italic truncate block max-w-[240px]">"{lead.aiLine}"</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Detail Drawer */}
        {selectedLead && (
          <div className="w-96 border-l border-border bg-card p-6 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-foreground">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary mb-3">
                {initials(selectedLead.name)}
              </div>
              <h4 className="text-lg font-bold text-foreground">{selectedLead.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedLead.role}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{selectedLead.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{selectedLead.company}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{selectedLead.role}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{selectedLead.lastContacted}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Source: {selectedLead.source}</span>
              </div>
            </div>

            {/* AI Line */}
            {selectedLead.aiLine && (
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">AI Opening Line</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{selectedLead.aiLine}"
                </p>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <span className={statusBadge(selectedLead.status)}>{selectedLead.status}</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Leads;
