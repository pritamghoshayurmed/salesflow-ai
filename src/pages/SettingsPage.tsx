import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { User, Mail, Key, CreditCard, Puzzle } from "lucide-react";

const tabs = [
  { label: "Profile", icon: User },
  { label: "Email Accounts", icon: Mail },
  { label: "API Keys", icon: Key },
  { label: "Billing", icon: CreditCard },
  { label: "Integrations", icon: Puzzle },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <TopNavbar title="Settings" subtitle="Manage your account" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  i === activeTab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 0 && (
            <div className="glass-card p-6 animate-fade-in space-y-6">
              <h3 className="text-sm font-semibold text-foreground">Profile Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                  <input defaultValue="Alex Johnson" className="w-full px-4 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input defaultValue="alex@salesflow.ai" className="w-full px-4 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Company</label>
                  <input defaultValue="SalesFlow AI" className="w-full px-4 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                  <input defaultValue="Executive Architect" className="w-full px-4 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                </div>
              </div>
              <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 1 && (
            <div className="glass-card p-6 animate-fade-in space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Connected Email Accounts</h3>
              <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">alex@salesflow.ai</p>
                    <p className="text-xs text-muted-foreground">Gmail · Connected</p>
                  </div>
                </div>
                <span className="badge-success">Active</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
                <Mail className="w-4 h-4" /> Add Email Account
              </button>
            </div>
          )}

          {activeTab === 2 && (
            <div className="glass-card p-6 animate-fade-in space-y-4">
              <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
              <div className="p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Production Key</p>
                  <span className="badge-success">Active</span>
                </div>
                <code className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg block">
                  sf_live_••••••••••••••••4f2k
                </code>
              </div>
              <button className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
                Generate New Key
              </button>
            </div>
          )}

          {activeTab === 3 && (
            <div className="glass-card p-6 animate-fade-in space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Billing</h3>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-foreground">Pro Plan</p>
                  <p className="text-lg font-bold text-primary">$99/mo</p>
                </div>
                <p className="text-xs text-muted-foreground">10,000 emails/month · Unlimited leads · AI features</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Upgrade Plan
              </button>
            </div>
          )}

          {activeTab === 4 && (
            <div className="glass-card p-6 animate-fade-in space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
              {["Salesforce", "HubSpot", "Slack", "Google Calendar"].map((name) => (
                <div key={name} className="p-4 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">Connect your {name} account</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SettingsPage;
