import React, { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useSales } from "@/context/SalesContext";
import { Video, Clock, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00"];

const CalendarPage = () => {
  const { calendarConnected, connectCalendar, autoBook, setAutoBook, metrics } = useSales();
  const [connecting, setConnecting] = useState(false);

  const meetings = calendarConnected && metrics.meetingsBooked > 0
    ? [
        { title: "Demo with Rachel Torres", time: "Today, 2:00 PM", company: "Snowflake", type: "Video Call" },
        ...(metrics.meetingsBooked > 1 ? [{ title: "Intro call — Kevin Huang", time: "Tomorrow, 10:00 AM", company: "Datadog", type: "Video Call" }] : []),
        ...(metrics.meetingsBooked > 2 ? [{ title: "Follow-up with Priya", time: "Thu, 3:00 PM", company: "Freshworks", type: "Phone" }] : []),
      ]
    : [];

  const calendarEvents: Record<string, Record<string, string>> = calendarConnected
    ? {
        Tue: { "10:00": "Kevin H · Datadog" },
        Wed: { "2:00": "Rachel T · Snowflake" },
        Thu: { "3:00": "Priya S · Freshworks" },
      }
    : {};

  const handleConnect = async () => {
    setConnecting(true);
    await connectCalendar();
    setConnecting(false);
    toast.success("Google Calendar connected!");
  };

  return (
    <>
      <TopNavbar title="Calendar" subtitle="Meetings and availability" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Calendar Connection Banner */}
        {!calendarConnected && (
          <div className="glass-card p-6 flex items-center justify-between animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Connect Google Calendar</h3>
              <p className="text-xs text-muted-foreground">Sync your calendar to auto-book meetings from positive replies.</p>
            </div>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {connecting ? "Connecting..." : "Connect"}
            </button>
          </div>
        )}

        {calendarConnected && (
          <div className="glass-card p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Google Calendar Connected</p>
                <p className="text-xs text-muted-foreground">Syncing meetings in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground">Auto-book from positive replies</label>
              <button
                onClick={() => {
                  setAutoBook(!autoBook);
                  toast.success(autoBook ? "Auto-book disabled" : "Auto-book enabled!");
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoBook ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${autoBook ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 glass-card p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-4">This Week</h3>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-0 min-w-[600px]">
                <div className="py-2" />
                {days.map((d) => (
                  <div key={d} className="text-center py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                    {d}
                  </div>
                ))}
                {hours.map((h) => (
                  <React.Fragment key={h}>
                    <div className="text-xs text-muted-foreground py-3 pr-3 text-right border-r border-border">
                      {h}
                    </div>
                    {days.map((d) => {
                      const event = calendarEvents[d]?.[h];
                      return (
                        <div key={`${d}-${h}`} className="py-3 px-1 border-b border-r border-border min-h-[48px]">
                          {event && (
                            <div className="px-2 py-1 rounded-lg bg-primary/10 text-xs font-medium text-primary truncate">
                              {event}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Meetings</h3>
            {meetings.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {calendarConnected ? "No meetings booked yet. Positive replies will auto-book." : "Connect your calendar to see meetings."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium text-foreground">{m.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {m.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {m.company}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Video className="w-3 h-3" /> {m.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

import React from "react";
export default CalendarPage;
