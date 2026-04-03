import { useNavigate } from "react-router";
import { Users, Shield, Sparkles, ChevronRight, Smartphone, Monitor, Zap } from "lucide-react";

const demoScript = [
  { step: 1, action: "Attendee Join → Feed", desc: "Open the Feed, browse pinned schedule & announcements" },
  { step: 2, action: 'Ask "fireworks time?"', desc: 'Type a question → see Suggested Answer → tap "This solved it"' },
  { step: 3, action: "Ask another question → Send", desc: "Submit a new question → navigate to My Q to see the thread" },
  { step: 4, action: "Admin Inbox → Open ticket", desc: "View the incoming question with Similar Questions cluster" },
  { step: 5, action: "Admin → Send Private reply", desc: "Reply privately → questioner sees it in My Q bubble thread" },
  { step: 6, action: "Admin → Publish as FAQ", desc: "Publish a ticket as FAQ → it appears as a new post in Attendee Feed" },
  { step: 7, action: "Attendee reacts & votes", desc: "React with emoji 👍 and vote in a poll on the Feed" },
];

const highlights = [
  { icon: Zap, label: "Zero install", desc: "Browser-only PWA" },
  { icon: Smartphone, label: "Mobile-first", desc: "Responsive from 390px" },
  { icon: Monitor, label: "Desktop-ready", desc: "Admin split-view at 1024px+" },
];

export function DemoStartPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-accent text-primary text-[12px] px-3 py-1 rounded-xl mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Demo
          </div>
          <h1 className="text-[28px] sm:text-[36px] text-foreground tracking-tight mb-2">
            Rapicial
          </h1>
          <p className="text-[14px] sm:text-[16px] text-muted-foreground max-w-md mx-auto">
            Event Operations, Simplified.<br />
            Experience both Attendee and Admin perspectives.
          </p>

          {/* Highlights */}
          <div className="flex justify-center gap-6 mt-6">
            {highlights.map((h) => (
              <div key={h.label} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <h.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[12px] text-foreground">{h.label}</p>
                <p className="text-[10px] text-muted-foreground">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Demo Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => navigate("/pwa/feed")}
            className="flex items-center gap-4 bg-white rounded-2xl border border-border/50 p-5 text-left hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] text-foreground mb-0.5">Demo as Attendee</p>
              <p className="text-[13px] text-muted-foreground">
                Browse Feed, ask questions, vote in polls
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0 group-hover:text-primary transition" />
          </button>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-4 bg-white rounded-2xl border border-border/50 p-5 text-left hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100/80 transition">
              <Shield className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] text-foreground mb-0.5">Demo as Admin</p>
              <p className="text-[13px] text-muted-foreground">
                Manage inbox, publish posts, moderate
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0 group-hover:text-primary transition" />
          </button>
        </div>

        {/* Demo Script */}
        <div className="bg-white rounded-2xl border border-border/50 p-5 sm:p-6 mb-8">
          <h2 className="text-[16px] text-foreground mb-1">Demo Script</h2>
          <p className="text-[12px] text-muted-foreground mb-5">
            Follow these 7 steps for a complete walkthrough
          </p>

          <div className="space-y-0">
            {demoScript.map((item, i) => (
              <div key={item.step} className="flex gap-3.5">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[12px] shrink-0">
                    {item.step}
                  </div>
                  {i < demoScript.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-5">
                  <p className="text-[14px] text-foreground">{item.action}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Info */}
        <div className="bg-accent/50 rounded-2xl border border-primary/10 p-5 mb-6">
          <p className="text-[11px] text-primary uppercase tracking-wider mb-2">Sample Event</p>
          <p className="text-[16px] text-foreground mb-1">Rapicial Demo Festival 2026</p>
          <p className="text-[13px] text-muted-foreground">
            Mar 28–29, 2026 · Main Campus / Stadium Zone
          </p>
          <p className="text-[12px] text-muted-foreground mt-2">
            10 announcements · 12 tickets · 8 active users · 2 live polls
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-[13px] text-muted-foreground hover:text-foreground transition"
          >
            ← Go to Login Page
          </button>
        </div>
      </div>
    </div>
  );
}
