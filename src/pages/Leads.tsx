import { useState, useCallback } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import { Upload, Sparkles, X, Mail, Building, Briefcase, Clock, FileUp, Users } from "lucide-react";
import { toast } from "sonner";

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
  const { leads, importLeads, enrichLeads } = useSales();
  const [selectedLead, setSelectedLead] = useState<typeof leads[0] | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleImport = useCallback(() => {
    importLeads();
    setShowUpload(false);
    toast.success("5 leads imported from CSV!");
  }, [importLeads]);

  const handleEnrich = useCallback(async () => {
    if (leads.length === 0) {
      toast.error("Import leads first before enriching.");
      return;
    }
    setEnriching(true);
    await enrichLeads();
    setEnriching(false);
    toast.success("AI personalization lines generated!");
  }, [leads.length, enrichLeads]);

  return (
    <>
      <TopNavbar title="Leads" subtitle="Manage your sales pipeline" />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              <Upload className="w-4 h-4" /> Upload CSV
            </button>
            <button
              onClick={handleEnrich}
              disabled={enriching || leads.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {enriching ? "Enriching..." : "Enrich & Generate AI Lines"}
            </button>
          </div>

          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowUpload(false)}>
              <div className="glass-card p-8 max-w-md w-full mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-foreground mb-2">Import Leads</h3>
                <p className="text-sm text-muted-foreground mb-6">Upload a CSV file or use our demo data.</p>
                <div
                  onClick={handleImport}
                  className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <FileUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Click to upload CSV</p>
                  <p className="text-xs text-muted-foreground mt-1">Or click to load 5 demo leads</p>
                </div>
                <button onClick={() => setShowUpload(false)} className="mt-4 w-full px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors text-foreground">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {leads.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-fade-in">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No leads yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Upload a CSV file to import your first batch of leads and start building personalized outreach.
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
                      <td className="px-4 py-3"><span className={statusBadge(lead.status)}>{lead.status}</span></td>
                      {leads.some((l) => l.aiLine) && (
                        <td className="px-4 py-3 hidden xl:table-cell">
                          {enriching ? (
                            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                          ) : lead.aiLine ? (
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
