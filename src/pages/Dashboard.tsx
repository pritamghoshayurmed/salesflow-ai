import TopNavbar from "@/components/TopNavbar";
import {
  DollarSign,
  CalendarCheck,
  MessageSquare,
  Zap,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const chartData = [
  { day: "Mon", sent: 120 }, { day: "Tue", sent: 185 }, { day: "Wed", sent: 145 },
  { day: "Thu", sent: 210 }, { day: "Fri", sent: 170 }, { day: "Sat", sent: 60 },
  { day: "Sun", sent: 40 },
  { day: "Mon", sent: 155 }, { day: "Tue", sent: 195 }, { day: "Wed", sent: 220 },
  { day: "Thu", sent: 180 }, { day: "Fri", sent: 200 },
];

const metrics = [
  { label: "Revenue", value: "$148,200", change: "+12.5%", icon: DollarSign, accent: true },
  { label: "Meetings Booked", value: "47", change: "+8.2%", icon: CalendarCheck },
  { label: "Reply Rate", value: "24.8%", change: "+3.1%", icon: MessageSquare },
  { label: "Active Sequences", value: "12", change: "+2", icon: Zap },
];

const recentWins = [
  { name: "Sarah Chen", company: "Stripe", status: "Booked" },
  { name: "Mike Rodriguez", company: "Notion", status: "Booked" },
  { name: "Lisa Park", company: "Linear", status: "Booked" },
  { name: "James Liu", company: "Figma", status: "Replied" },
];

const campaigns = [
  { name: "Q1 Enterprise Push", openRate: "68%", replies: 34, progress: 72 },
  { name: "Series B Founders", openRate: "54%", replies: 18, progress: 45 },
  { name: "VP Sales Outreach", openRate: "71%", replies: 42, progress: 88 },
];

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("");

const Dashboard = () => {
  return (
    <>
      <TopNavbar title="Executive Architect" subtitle="Welcome back, let's close some deals." />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
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
                <span className="text-xs font-medium text-primary flex items-center gap-0.5 mb-1">
                  <TrendingUp className="w-3 h-3" /> {m.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Recent Wins */}
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
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Wins</h3>
            <div className="space-y-4">
              {recentWins.map((w) => (
                <div key={w.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {initials(w.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.company}</p>
                  </div>
                  <span className={w.status === "Booked" ? "badge-success" : "badge-info"}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Active Campaigns</h3>
            <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div key={c.name} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">Open: {c.openRate}</span>
                    <span className="text-xs text-muted-foreground">Replies: {c.replies}</span>
                  </div>
                </div>
                <div className="w-32 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{c.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
