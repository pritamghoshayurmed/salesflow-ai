import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { Upload, Plus, Sparkles, X, Mail, Building, Briefcase, Clock } from "lucide-react";

const leadsData = [
  { id: 1, name: "Sarah Chen", email: "sarah@stripe.com", company: "Stripe", role: "VP Sales", status: "Qualified", lastContacted: "2 hours ago" },
  { id: 2, name: "Mike Rodriguez", email: "mike@notion.so", company: "Notion", role: "Head of Growth", status: "Contacted", lastContacted: "1 day ago" },
  { id: 3, name: "Lisa Park", email: "lisa@linear.app", company: "Linear", role: "CRO", status: "New", lastContacted: "Never" },
  { id: 4, name: "James Liu", email: "james@figma.com", company: "Figma", role: "Director Sales", status: "Qualified", lastContacted: "3 hours ago" },
  { id: 5, name: "Anna Kim", email: "anna@vercel.com", company: "Vercel", role: "VP Revenue", status: "Replied", lastContacted: "5 mins ago" },
  { id: 6, name: "David Patel", email: "david@databricks.com", company: "Databricks", role: "Head of Sales", status: "New", lastContacted: "Never" },
  { id: 7, name: "Emma Wilson", email: "emma@openai.com", company: "OpenAI", role: "GTM Lead", status: "Contacted", lastContacted: "2 days ago" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Qualified: "badge-success",
    Contacted: "badge-info",
    New: "badge-neutral",
    Replied: "badge-warning",
  };
  return map[status] || "badge-neutral";
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

const Leads = () => {
  const [selectedLead, setSelectedLead] = useState<typeof leadsData[0] | null>(null);

  return (
    <>
      <TopNavbar title="Leads" subtitle="Manage your sales pipeline" />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Lead
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
              <Upload className="w-4 h-4" /> Upload CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
              <Sparkles className="w-4 h-4 text-primary" /> Enrich Leads
            </button>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Company</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Role</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Last Contacted</th>
                </tr>
              </thead>
              <tbody>
                {leadsData.map((lead) => (
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
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{lead.lastContacted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

            {/* AI Insights */}
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">AI Insights</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                High engagement probability. {selectedLead.name} recently posted about scaling sales ops. 
                Best approach: reference their company's recent Series B and connect to ROI.
              </p>
            </div>

            {/* Activity Timeline */}
            <div className="mt-6">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Activity</h5>
              <div className="space-y-3">
                {["Email opened (2h ago)", "Sequence started (1d ago)", "Lead enriched (3d ago)"].map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Leads;
