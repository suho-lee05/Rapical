import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  FileText,
  PlusCircle,
  Wrench,
  Settings,
  ChevronDown,
  Search,
  BarChart3,
  Vote,
} from "lucide-react";
import { api, type Space } from "../../lib/api";
import {
  clearAdminSession,
  clearSelectedSpaceId,
  getAdminSession,
  setSelectedSpaceId,
  useSelectedSpaceId,
} from "../../lib/admin-session";
import { toast } from "sonner";

const mobileNavItems = [
  { path: "/admin/dashboard", label: "Inbox", icon: Inbox },
  { path: "/admin/posts", label: "Posts", icon: FileText },
  { path: "/admin/create", label: "Create", icon: PlusCircle },
  { path: "/admin/tools", label: "Tools", icon: Wrench },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const sidebarNavItems = [
  { path: "/admin/dashboard", label: "Inbox", icon: Inbox },
  { path: "/admin/posts", label: "Posts", icon: FileText },
  { path: "/admin/create", label: "Create", icon: PlusCircle },
  { path: "/admin/polls", label: "Polls", icon: Vote },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin/tools", label: "Tools", icon: Wrench },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const selectedSpaceId = useSelectedSpaceId();
  const admin = getAdminSession();

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
    }
  }, [admin, navigate]);

  useEffect(() => {
    async function loadSpaces() {
      if (!admin) return;
      try {
        const data = await api.getSpaces({ createdBy: admin.AdminID });
        setSpaces(data);

        if (!data.length) {
          clearSelectedSpaceId();
          return;
        }

        const hasCurrentSelection = selectedSpaceId
          ? data.some((space) => space.SpaceID === selectedSpaceId)
          : false;

        if (hasCurrentSelection) return;

        const activeSpace = data.find((space) => space.Status === "active") || data[0];
        setSelectedSpaceId(activeSpace.SpaceID);
      } catch (error) {
        const message = error instanceof Error ? error.message : "공간 목록 조회 실패";
        toast.error(message);
      }
    }

    loadSpaces();
  }, [admin, selectedSpaceId]);

  const selectedSpace = useMemo(
    () => spaces.find((space) => space.SpaceID === selectedSpaceId) || null,
    [spaces, selectedSpaceId],
  );

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-white/90 backdrop-blur-md border-r border-border/80 flex-col shrink-0">
        <div className="h-[68px] flex items-center px-5 border-b border-border/80">
          <h1
            className="text-[24px] font-bold text-primary tracking-tight cursor-pointer"
            onClick={() => navigate("/admin/dashboard")}
          >
            Rapicial
          </h1>
          <span className="ml-2 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">Admin</span>
        </div>

        {/* Event selector */}
        <div className="px-3 py-3 border-b border-border/80">
          <div className="w-full flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl bg-muted/70 border border-border/70 text-[15px] font-semibold">
            <select
              value={selectedSpaceId ?? ""}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isFinite(value) || !value) {
                  clearSelectedSpaceId();
                  return;
                }
                setSelectedSpaceId(value);
              }}
              className="w-full bg-transparent focus:outline-none font-semibold"
            >
              {spaces.length === 0 && <option value="">Space 없음</option>}
              {spaces.map((space) => (
                <option key={space.SpaceID} value={space.SpaceID}>
                  {space.SpaceName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </div>

        <nav className="flex-1 px-3 py-2.5 space-y-1">
          {sidebarNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/admin/dashboard" && location.pathname.startsWith("/admin/ticket"));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] transition ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-border/80">
          <button
            onClick={handleLogout}
            className="w-full text-[12px] text-muted-foreground hover:text-foreground transition px-3 py-1.5 text-left"
          >
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="surface-header lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="text-[21px] font-bold text-primary tracking-tight">Rapicial</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/70 border border-border/70 text-[14px] font-semibold text-foreground">
                <select
                  value={selectedSpaceId ?? ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!Number.isFinite(value) || !value) {
                      clearSelectedSpaceId();
                      return;
                    }
                    setSelectedSpaceId(value);
                  }}
                  className="bg-transparent focus:outline-none max-w-[180px] font-semibold"
                >
                  {spaces.length === 0 && <option value="">No Space</option>}
                  {spaces.map((space) => (
                    <option key={space.SpaceID} value={space.SpaceID}>
                      {space.SpaceName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </div>
            </div>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex h-[60px] bg-white/90 backdrop-blur-md border-b border-border/80 items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-56 pl-8 pr-3 rounded-xl bg-input-background border border-border/70 text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div
              title={admin?.AdminName || ""}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[13px]"
            >
              {(admin?.AdminName || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="surface-bottom-nav lg:hidden">
        <div className="flex items-center justify-around h-[60px]">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/admin/dashboard" && location.pathname.startsWith("/admin/ticket"));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
