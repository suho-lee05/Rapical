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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around h-14 max-w-[500px] mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
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