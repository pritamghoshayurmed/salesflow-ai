import TopNavbar from "@/components/TopNavbar";
import { Video, Clock, MapPin } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00"];

const meetings = [
  { title: "Demo with Sarah Chen", time: "Today, 2:00 PM", company: "Stripe", type: "Video Call" },
  { title: "Intro call — Lisa Park", time: "Tomorrow, 10:00 AM", company: "Linear", type: "Video Call" },
  { title: "Follow-up with James", time: "Thu, 3:00 PM", company: "Figma", type: "Phone" },
];

const calendarEvents: Record<string, Record<string, string>> = {
  Tue: { "10:00": "Lisa Park · Linear", "2:00": "Team Standup" },
  Wed: { "11:00": "Sarah Chen · Stripe" },
  Thu: { "3:00": "James Liu · Figma" },
};

const CalendarPage = () => {
  return (
    <>
      <TopNavbar title="Calendar" subtitle="Meetings and availability" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 glass-card p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-4">This Week</h3>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-0 min-w-[600px]">
                {/* Header */}
                <div className="py-2" />
                {days.map((d) => (
                  <div key={d} className="text-center py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                    {d}
                  </div>
                ))}

                {/* Time slots */}
                {hours.map((h) => (
                  <>
                    <div key={`label-${h}`} className="text-xs text-muted-foreground py-3 pr-3 text-right border-r border-border">
                      {h}
                    </div>
                    {days.map((d) => {
                      const event = calendarEvents[d]?.[h];
                      return (
                        <div
                          key={`${d}-${h}`}
                          className="py-3 px-1 border-b border-r border-border min-h-[48px]"
                        >
                          {event && (
                            <div className="px-2 py-1 rounded-lg bg-primary/10 text-xs font-medium text-primary truncate">
                              {event}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Meetings</h3>
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
            <button className="w-full mt-4 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">
              Sync Google Calendar
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default CalendarPage;
