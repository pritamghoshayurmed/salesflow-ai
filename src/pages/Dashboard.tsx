import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import {
  Users,
  Mail,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  Zap,
  Send,
  Reply,
  Sparkles,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const chartData = [
  { day: "Mon", sent: 120 }, { day: "Tue", sent: 185 }, { day: "Wed", sent: 145 },
  { day: "Thu", sent: 210 }, { day: "Fri", sent: 170 }, { day: "Sat", sent: 60 },
  { day: "Sun", sent: 40 }, { day: "Mon", sent: 155 }, { day: "Tue", sent: 195 },
  { day: "Wed", sent: 220 }, { day: "Thu", sent: 180 }, { day: "Fri", sent: 200 },
];

const activityIcon = (type: string) => {
  switch (type) {
    case "send": return <Send className="w-3 h-3 text-primary" />;
    case "reply": return <Reply className="w-3 h-3 text-info" />;
    case "booked": return <CalendarCheck className="w-3 h-3 text-primary" />;
    case "enriched": return <Sparkles className="w-3 h-3 text-warning" />;
    case "campaign": return <Zap className="w-3 h-3 text-primary" />;
    default: return <Send className="w-3 h-3 text-muted-foreground" />;
  }
};

const Dashboard = () => {
  const { metrics, activityFeed, campaigns } = useSales();

  const cards = [
    { label: "Total Leads", value: metrics.totalLeads.toString(), icon: Users, change: metrics.totalLeads > 0 ? `+${metrics.totalLeads}` : "—" },
    { label: "Emails Sent", value: metrics.emailsSent.toString(), icon: Mail, change: metrics.emailsSent > 0 ? `+${metrics.emailsSent}` : "—" },
    { label: "Reply Rate", value: `${metrics.replyRate}%`, icon: MessageSquare, change: metrics.replyRate > 0 ? `+${metrics.replyRate}%` : "—" },
    { label: "Meetings Booked", value: metrics.meetingsBooked.toString(), icon: CalendarCheck, change: metrics.meetingsBooked > 0 ? `+${metrics.meetingsBooked}` : "—", accent: true },
  ];

  return (
    <>
      <TopNavbar title="Executive Architect" subtitle="Welcome back, let's close some deals." />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((m) => (
            <div
              key={m.label}
              className={`metric-card animate-fade-in ${
                m.accent ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <m.icon className={`w-5 h-5 ${m.accent ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-foreground">{m.value}</span>
                {m.change !== "—" && (
                  <span className="text-xs font-medium text-primary flex items-center gap-0.5 mb-1">
                    <TrendingUp className="w-3 h-3" /> {m.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Outreach Volume</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215 15% 47%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215 15% 47%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 100%)",
                    border: "1px solid hsl(214 20% 92%)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="sent" fill="hsl(142 71% 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Live Activity</h3>
            {activityFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Zap className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No activity yet.</p>
                <p className="text-xs text-muted-foreground">Import leads to get started.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {activityFeed.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 animate-fade-in">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      {activityIcon(ev.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{ev.text}</p>
                      <p className="text-[10px] text-muted-foreground">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Active Campaigns</h3>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No campaigns yet. Create one from the Campaigns tab.</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div key={c.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">Status: {c.status}</span>
                      <span className="text-xs text-muted-foreground">Open: {c.openRate}</span>
                      <span className="text-xs text-muted-foreground">Replies: {c.replyRate}</span>
                    </div>
                  </div>
                  <span className={c.status === "Active" ? "badge-success" : "badge-neutral"}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Dashboard;
