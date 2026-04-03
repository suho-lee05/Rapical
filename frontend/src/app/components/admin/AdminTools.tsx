import { useState } from "react";
import { ShieldOff, Ban, UserCheck, Timer, Link2Off } from "lucide-react";

const users = [
  { id: "u1", name: "Anonymous #4821", status: "active" as const, questions: 3, joined: "10:15 AM" },
  { id: "u2", name: "John K.", status: "active" as const, questions: 1, joined: "10:22 AM" },
  { id: "u3", name: "Anonymous #1092", status: "muted" as const, questions: 5, joined: "10:30 AM" },
  { id: "u4", name: "Sarah L.", status: "active" as const, questions: 2, joined: "10:45 AM" },
  { id: "u5", name: "Anonymous #7733", status: "banned" as const, questions: 8, joined: "11:00 AM" },
  { id: "u6", name: "MinJun P.", status: "active" as const, questions: 0, joined: "11:15 AM" },
  { id: "u7", name: "Anonymous #8812", status: "active" as const, questions: 4, joined: "11:30 AM" },
  { id: "u8", name: "Anonymous #3317", status: "active" as const, questions: 2, joined: "11:45 AM" },
];

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  muted: "bg-amber-50 text-amber-700",
  banned: "bg-red-50 text-red-600",
};

export function AdminTools() {
  const [showModal, setShowModal] = useState<{ userId: string; action: string } | null>(null);
  const [rateLimit, setRateLimit] = useState(true);
  const [linkRestriction, setLinkRestriction] = useState(true);

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:mx-0">
      <h2 className="text-[20px] text-foreground mb-1">Tools</h2>
      <p className="text-[12px] text-muted-foreground mb-5">Users & moderation</p>

      {/* Moderation Controls */}
      <div className="bg-white rounded-2xl border border-border/50 p-4 mb-5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3">Controls</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[14px] text-foreground">Rate limit</p>
                <p className="text-[11px] text-muted-foreground">1 question per 30 seconds</p>
              </div>
            </div>
            <button
              onClick={() => setRateLimit(!rateLimit)}
              className={`w-10 h-[22px] rounded-full transition relative ${rateLimit ? "bg-primary" : "bg-switch-background"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${rateLimit ? "translate-x-[18px]" : ""}`} />
            </button>
          </div>
          <div className="border-t border-border/50" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link2Off className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[14px] text-foreground">Link restriction</p>
                <p className="text-[11px] text-muted-foreground">Block external links in questions</p>
              </div>
            </div>
            <button
              onClick={() => setLinkRestriction(!linkRestriction)}
              className={`w-10 h-[22px] rounded-full transition relative ${linkRestriction ? "bg-primary" : "bg-switch-background"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${linkRestriction ? "translate-x-[18px]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* User/session list */}
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Sessions ({users.length})</p>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl border border-border/50 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-[13px] text-muted-foreground shrink-0">
                  {user.name.charAt(0) === "A" ? "?" : user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] text-foreground">{user.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-lg ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {user.questions} questions · Joined {user.joined}
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                {user.status !== "muted" && (
                  <button
                    onClick={() => setShowModal({ userId: user.id, action: "mute" })}
                    className="p-2 rounded-xl hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition"
                    title="Mute"
                  >
                    <ShieldOff className="w-4 h-4" />
                  </button>
                )}
                {user.status === "banned" ? (
                  <button
                    onClick={() => setShowModal({ userId: user.id, action: "unban" })}
                    className="p-2 rounded-xl hover:bg-green-50 text-muted-foreground hover:text-green-600 transition"
                    title="Unban"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowModal({ userId: user.id, action: "ban" })}
                    className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-600 transition"
                    title="Ban"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal — bottom sheet style on mobile */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] text-foreground mb-1.5">Confirm Action</h3>
            <p className="text-[14px] text-muted-foreground mb-5">
              Are you sure you want to {showModal.action} this user?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(null)} className="flex-1 py-2.5 rounded-xl text-[14px] bg-muted text-foreground hover:bg-muted/80 transition">
                Cancel
              </button>
              <button
                onClick={() => setShowModal(null)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] text-white transition ${
                  showModal.action === "ban" ? "bg-destructive hover:bg-red-700" : "bg-primary hover:bg-green-700"
                }`}
              >
                {showModal.action.charAt(0).toUpperCase() + showModal.action.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
