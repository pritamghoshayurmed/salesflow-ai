import { Search, Bell, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface TopNavbarProps {
  title: string;
  subtitle?: string;
}

const TopNavbar = ({ title, subtitle }: TopNavbarProps) => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-64 rounded-xl bg-muted border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* New Campaign */}
        <Link
          to="/campaigns"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-sm font-bold text-primary-foreground">
          EA
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
