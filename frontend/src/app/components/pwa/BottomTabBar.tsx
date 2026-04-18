import { useLocation, useNavigate } from "react-router";
import { Megaphone, MessageCircleQuestion, Inbox } from "lucide-react";

const tabs = [
  { path: "/pwa/feed", label: "Feed", icon: Megaphone },
  { path: "/pwa/ask", label: "Ask", icon: MessageCircleQuestion },
  { path: "/pwa/my-q", label: "My Q", icon: Inbox },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="surface-bottom-nav">
      <div className="flex items-center justify-around h-[60px] max-w-[540px] mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}