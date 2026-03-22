import { Link } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import { Sparkles, ArrowRight } from "lucide-react";

const AILab = () => {
  return (
    <>
      <TopNavbar title="AI Lab" subtitle="Personalization has moved into campaign launch" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="glass-card p-10 max-w-3xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">AI personalization is now part of Campaigns</h3>
          <p className="text-sm text-muted-foreground mb-6">
            To keep your workflow in one place, AI lead personalization now happens directly inside the campaign setup flow,
            right before launch.
          </p>
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Go to Campaigns
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </>
  );
};

export default AILab;
