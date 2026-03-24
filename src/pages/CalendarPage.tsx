import React, { useState, useMemo } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import {
  Video, Clock, MapPin, CheckCircle2, Loader2, Calendar,
  ChevronLeft, ChevronRight, Plus, Link2, Settings, Users,
  Zap, Bell, MoreHorizontal, ExternalLink, X, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ── Calendar constants ──────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type ViewMode = "week" | "month" | "agenda";

interface Meeting {
  id: string;
  title: string;
  company: string;
  time: string;
  type: "Video Call" | "Phone" | "In-Person";
  day: string;
  hour: string;
  color: string;
  status: "confirmed" | "pending";
  link?: string;
}

const MEETING_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
];

const MOCK_MEETINGS_BASE: Meeting[] = [
  { id: "m1", title: "Demo — Rachel Torres", company: "Snowflake", time: "2:00 PM", type: "Video Call", day: "Wed", hour: "2:00", color: MEETING_COLORS[0], status: "confirmed", link: "https://meet.google.com/abc-def-ghi" },
  { id: "m2", title: "Intro call — Kevin Huang", company: "Datadog", time: "10:00 AM", type: "Video Call", day: "Tue", hour: "10:00", color: MEETING_COLORS[1], status: "confirmed", link: "https://meet.google.com/xyz-123" },
  { id: "m3", title: "Follow-up — Priya Sharma", company: "Freshworks", time: "3:00 PM", type: "Phone", day: "Thu", hour: "3:00", color: MEETING_COLORS[2], status: "pending" },
];

// Get current week's Mon–Fri dates
const getWeekDates = (offset = 0) => {
  const now = new Date(2026, 2, 24); // March 24 2026 (current date from context)
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  return DAYS.map((d, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { day: d, date: date.getDate(), month: date.getMonth(), full: date };
  });
};

// ── Component ─────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const { calendarConnected, connectCalendar, autoBook, setAutoBook, metrics, markConverted } = useSales();
  const [connecting, setConnecting] = useState(false);
  const [view, setView] = useState<ViewMode>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingTime, setNewMeetingTime] = useState("10:00");
  const [newMeetingDay, setNewMeetingDay] = useState("Mon");

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Build dynamic meetings from bookings
  const meetings: Meeting[] = useMemo(() => {
    if (!calendarConnected) return [];
    const base = MOCK_MEETINGS_BASE.slice(0, Math.min(3, metrics.meetingsBooked));
    return base;
  }, [calendarConnected, metrics.meetingsBooked]);

  // Build calendar event map
  const calendarEvents: Record<string, Record<string, Meeting>> = useMemo(() => {
    const map: Record<string, Record<string, Meeting>> = {};
    meetings.forEach((m) => {
      if (!map[m.day]) map[m.day] = {};
      map[m.day][m.hour] = m;
    });
    return map;
  }, [meetings]);

  const handleConnect = async () => {
    setConnecting(true);
    await connectCalendar();
    setConnecting(false);
    toast.success("✅ Google Calendar connected! Auto-book is ready.");
  };

  const handleBookMeeting = () => {
    if (!newMeetingTitle.trim()) { toast.error("Enter a meeting title"); return; }
    markConverted(Date.now());
    toast.success(`📅 Meeting "${newMeetingTitle}" scheduled for ${newMeetingDay} at ${newMeetingTime}!`);
    setShowNewMeeting(false);
    setNewMeetingTitle("");
  };

  const todayDate = 24; // March 24 2026

  return (
    <>
      <TopNavbar title="Calendar" subtitle="Meeting management · Auto-book from positive replies" />

      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* ── Connection Banner ── */}
        {!calendarConnected ? (
          <div className="glass-card p-5 flex items-center gap-5 animate-fade-in border-l-4 border-l-amber-400">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Connect Google Calendar</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sync your availability, auto-book meetings from positive inbox replies, and send calendar invites automatically.
              </p>
            </div>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0 shadow-sm"
            >
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              {connecting ? "Connecting..." : "Connect Calendar"}
            </button>
          </div>
        ) : (
          <div className="glass-card p-4 flex items-center gap-4 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Google Calendar Connected</p>
              <p className="text-xs text-muted-foreground">Syncing in real-time · {meetings.length} meetings this week</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Auto-book from replies</span>
                <button
                  onClick={() => {
                    setAutoBook(!autoBook);
                    toast.success(autoBook ? "Auto-book disabled" : "🤖 Auto-book enabled — positive replies will book meetings!");
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${autoBook ? "bg-primary" : "bg-muted border border-border"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${autoBook ? "translate-x-5" : ""}`} />
                </button>
              </div>
              {autoBook && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Auto-booking ON
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Main Calendar Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Calendar View */}
          <div className="xl:col-span-2 glass-card overflow-hidden animate-fade-in">
            {/* Calendar toolbar */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset((o) => o - 1)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <h3 className="text-sm font-bold text-foreground">
                  {weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : weekOffset === -1 ? "Last Week" : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
                  {" · "}
                  <span className="text-muted-foreground font-normal">
                    {MONTH_NAMES[weekDates[0].month]} {weekDates[0].date}–{weekDates[4].date}
                  </span>
                </h3>
                <button
                  onClick={() => setWeekOffset((o) => o + 1)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                  >
                    Today
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-border overflow-hidden">
                  {(["week", "agenda"] as ViewMode[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {calendarConnected && (
                  <button
                    onClick={() => setShowNewMeeting(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" /> Schedule
                  </button>
                )}
              </div>
            </div>

            {/* Week Grid View */}
            {view === "week" && (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 min-w-[560px]">
                  {/* Header */}
                  <div className="py-3 border-b border-border" />
                  {weekDates.map(({ day, date }) => {
                    const isToday = weekOffset === 0 && date === todayDate;
                    return (
                      <div
                        key={day}
                        className={`py-3 text-center border-b border-r border-border ${isToday ? "bg-primary/5" : ""}`}
                      >
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{day}</p>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-bold ${
                          isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                        }`}>
                          {date}
                        </div>
                      </div>
                    );
                  })}

                  {/* Hour rows */}
                  {HOURS.map((h) => (
                    <React.Fragment key={h}>
                      <div className="text-[10px] text-muted-foreground py-3 pr-3 text-right border-r border-b border-border leading-none pt-3.5">
                        {h}
                      </div>
                      {DAYS.map((d) => {
                        const event = calendarEvents[d]?.[h];
                        const isToday = weekOffset === 0 && d === "Tue"; // March 24 is Tuesday
                        return (
                          <div
                            key={`${d}-${h}`}
                            className={`py-1.5 px-1 border-b border-r border-border min-h-[52px] transition-colors ${
                              isToday ? "bg-primary/[0.03]" : "hover:bg-muted/30"
                            }`}
                          >
                            {event && (
                              <button
                                onClick={() => setSelectedMeeting(event)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg border text-[10px] font-semibold truncate transition-all hover:shadow-sm ${event.color}`}
                              >
                                <p className="truncate leading-tight">{event.title.split("—")[1]?.trim() || event.title}</p>
                                <p className="opacity-70 font-normal">{event.time}</p>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda View */}
            {view === "agenda" && (
              <div className="p-5">
                {meetings.length === 0 ? (
                  <div className="py-12 text-center">
                    <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No meetings scheduled</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {calendarConnected ? "Positive replies will auto-book meetings here" : "Connect your calendar first"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meetings.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMeeting(m)}
                        className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${m.color}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{m.title}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs opacity-80">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.time} · {m.day}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.company}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.status === "confirmed" ? "bg-white/70 text-current" : "bg-white/40 text-current"}`}>
                          {m.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty state overlay for non-connected */}
            {!calendarConnected && (
              <div className="p-8 text-center border-t border-dashed border-border bg-muted/20">
                <p className="text-xs text-muted-foreground">Connect Google Calendar to see and manage meetings</p>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4">
            {/* Upcoming Meetings */}
            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Upcoming Meetings</h3>
                <span className="text-xs text-muted-foreground">{meetings.length} this week</span>
              </div>

              {meetings.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {calendarConnected
                      ? "No meetings booked. Positive inbox replies will auto-book here."
                      : "Connect your calendar to start booking meetings."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      className="w-full text-left p-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${m.status === "confirmed" ? "bg-emerald-500" : "bg-amber-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">{m.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{m.time} · {m.day}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            <Video className="w-2.5 h-2.5" />
                            <span>{m.type}</span>
                          </div>
                        </div>
                      </div>
                      {m.link && (
                        <div className={`mt-2.5 flex items-center gap-1 text-[10px] text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
                          <ExternalLink className="w-2.5 h-2.5" />
                          Join meeting link
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h3 className="text-sm font-bold text-foreground mb-4">Meeting Stats</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Booked", value: metrics.meetingsBooked, icon: Calendar, color: "text-blue-600 bg-blue-50" },
                  { label: "This Week", value: meetings.length, icon: Clock, color: "text-violet-600 bg-violet-50" },
                  { label: "From AI Replies", value: metrics.meetingsBooked, icon: Sparkles, color: "text-emerald-600 bg-emerald-50" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color.split(" ").slice(1).join(" ")}`}>
                        <Icon className={`w-3.5 h-3.5 ${color.split(" ")[0]}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Settings */}
            {calendarConnected && (
              <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-sm font-bold text-foreground mb-4">Booking Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: "Meeting Duration", value: "30 min" },
                    { label: "Buffer Time", value: "15 min" },
                    { label: "Available Hours", value: "9am – 5pm" },
                    { label: "Time Zone", value: "IST (UTC+5:30)" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors text-muted-foreground">
                  <Settings className="w-3 h-3" /> Edit Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Meeting Detail Modal ── */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMeeting(null)}>
          <div
            className="glass-card p-6 w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedMeeting.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedMeeting.company}</p>
              </div>
              <button onClick={() => setSelectedMeeting(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { icon: Clock, label: "Time", value: `${selectedMeeting.day}, ${selectedMeeting.time}` },
                { icon: Video, label: "Type", value: selectedMeeting.type },
                { icon: MapPin, label: "Company", value: selectedMeeting.company },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {selectedMeeting.link && (
                <a
                  href={selectedMeeting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Video className="w-3.5 h-3.5" /> Join Meeting
                </a>
              )}
              <button
                onClick={() => { toast.success("Reminder set!"); setSelectedMeeting(null); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
              >
                <Bell className="w-3.5 h-3.5" /> Remind Me
              </button>
              <button
                onClick={() => {
                  toast.info("Meeting rescheduling coming soon");
                  setSelectedMeeting(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
              >
                <Calendar className="w-3.5 h-3.5" /> Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Meeting Modal ── */}
      {showNewMeeting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewMeeting(false)}>
          <div
            className="glass-card p-6 w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground">Schedule Meeting</h3>
              <button onClick={() => setShowNewMeeting(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Meeting Title</label>
                <input
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  placeholder="e.g., Demo with Rachel Torres · Snowflake"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Day</label>
                  <select
                    value={newMeetingDay}
                    onChange={(e) => setNewMeetingDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  >
                    {DAYS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
                  <select
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  >
                    {HOURS.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBookMeeting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Calendar className="w-4 h-4" /> Schedule Meeting
              </button>
              <button
                onClick={() => setShowNewMeeting(false)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarPage;
