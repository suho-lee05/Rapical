import { useState } from "react";
import { ChevronRight, RotateCw, Plus, X } from "lucide-react";

export function AdminSettings() {
  const [joinMode, setJoinMode] = useState<"qr" | "qr_code">("qr");
  const [eventCode, setEventCode] = useState("4829");

  const admins = [
    { name: "Admin", email: "admin@rapicial.com", role: "Owner" },
    { name: "Moderator 1", email: "mod1@rapicial.com", role: "Moderator" },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto lg:mx-0">
      <h2 className="text-[20px] text-foreground mb-1">Settings</h2>
      <p className="text-[12px] text-muted-foreground mb-6">Event space configuration</p>

      {/* Event Settings */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Join Mode</p>
          </div>

          <div className="p-4 space-y-3">
            <label className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition ${joinMode === "qr" ? "border-primary bg-accent" : "border-border"}`}>
              <input type="radio" name="join" checked={joinMode === "qr"} onChange={() => setJoinMode("qr")} className="accent-primary" />
              <div>
                <p className="text-[14px] text-foreground">QR Code only</p>
                <p className="text-[11px] text-muted-foreground">Attendees join by scanning QR</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition ${joinMode === "qr_code" ? "border-primary bg-accent" : "border-border"}`}>
              <input type="radio" name="join" checked={joinMode === "qr_code"} onChange={() => setJoinMode("qr_code")} className="accent-primary" />
              <div>
                <p className="text-[14px] text-foreground">QR + Event Code</p>
                <p className="text-[11px] text-muted-foreground">Both QR and manual code entry</p>
              </div>
            </label>

            {joinMode === "qr_code" && (
              <div className="flex items-center gap-3 pt-1">
                <div>
                  <p className="text-[12px] text-muted-foreground mb-1">Current code</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[20px] text-foreground tracking-[0.3em] tabular-nums">{eventCode}</span>
                    <button
                      onClick={() => setEventCode(String(Math.floor(1000 + Math.random() * 9000)))}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                      title="Rotate code"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Team</p>
            <button className="flex items-center gap-1 text-[12px] text-primary">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {admins.map((admin, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[12px] text-primary">
                  {admin.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] text-foreground">{admin.name}</p>
                  <p className="text-[11px] text-muted-foreground">{admin.email}</p>
                </div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                admin.role === "Owner" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {admin.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
