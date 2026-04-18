import { useEffect, useMemo, useState } from "react";
import { ShieldOff, Ban, UserCheck, Timer, Link2Off } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, type Participant } from "../../lib/api";
import { useSelectedSpaceId } from "../../lib/admin-session";

type ToolConfig = {
  rateLimit: boolean;
  linkRestriction: boolean;
};

function getToolConfigKey(spaceId: number) {
  return `rapical.tools.${spaceId}`;
}

function loadToolConfig(spaceId: number | null): ToolConfig {
  if (!spaceId) return { rateLimit: true, linkRestriction: true };
  const raw = localStorage.getItem(getToolConfigKey(spaceId));
  if (!raw) return { rateLimit: true, linkRestriction: true };
  try {
    return JSON.parse(raw) as ToolConfig;
  } catch {
    return { rateLimit: true, linkRestriction: true };
  }
}

function saveToolConfig(spaceId: number | null, config: ToolConfig) {
  if (!spaceId) return;
  localStorage.setItem(getToolConfigKey(spaceId), JSON.stringify(config));
}

export function AdminTools() {
  const spaceId = useSelectedSpaceId();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showModal, setShowModal] = useState<{
    participant: Participant;
    action: "restrict" | "kick" | "activate";
  } | null>(null);
  const [config, setConfig] = useState<ToolConfig>(() => loadToolConfig(spaceId));
  const [loading, setLoading] = useState(false);

  async function loadParticipants() {
    if (!spaceId) return;
    setLoading(true);
    try {
      const data = await api.getParticipants({ spaceId });
      setParticipants(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "참여자 조회 실패";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setConfig(loadToolConfig(spaceId));
    loadParticipants();
  }, [spaceId]);

  useEffect(() => {
    saveToolConfig(spaceId, config);
  }, [config, spaceId]);

  const statusColors: Record<Participant["Status"], string> = {
    active: "bg-green-50 text-green-700",
    restricted: "bg-amber-50 text-amber-700",
    kicked: "bg-red-50 text-red-600",
  };

  const stats = useMemo(() => {
    return {
      active: participants.filter((participant) => participant.Status === "active").length,
      restricted: participants.filter((participant) => participant.Status === "restricted").length,
      kicked: participants.filter((participant) => participant.Status === "kicked").length,
    };
  }, [participants]);

  const applyAction = async () => {
    if (!showModal) return;

    const targetStatus =
      showModal.action === "activate"
        ? "active"
        : showModal.action === "restrict"
          ? "restricted"
          : "kicked";

    const previous = participants;
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.ParticipantID === showModal.participant.ParticipantID
          ? { ...participant, Status: targetStatus, UpdatedAt: new Date().toISOString() }
          : participant,
      ),
    );
    setShowModal(null);

    try {
      await api.updateParticipant(showModal.participant.ParticipantID, { Status: targetStatus });
      toast.success(`사용자 상태가 ${targetStatus}로 변경되었습니다.`);
    } catch (error) {
      setParticipants(previous);
      const message = error instanceof Error ? error.message : "사용자 상태 변경 실패";
      toast.error(message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:mx-0">
      <Toaster position="top-center" richColors />
      <h2 className="text-[20px] text-foreground mb-1">Tools</h2>
      <p className="text-[12px] text-muted-foreground mb-5">Users & moderation</p>

      <div className="bg-white rounded-2xl border border-border/50 p-4 mb-5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3">Controls</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[14px] text-foreground">Rate limit</p>
                <p className="text-[11px] text-muted-foreground">질문 빈도 제한 설정 (클라이언트)</p>
              </div>
            </div>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, rateLimit: !prev.rateLimit }))}
              className={`w-10 h-[22px] rounded-full transition relative ${
                config.rateLimit ? "bg-primary" : "bg-switch-background"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
                  config.rateLimit ? "translate-x-[18px]" : ""
                }`}
              />
            </button>
          </div>
          <div className="border-t border-border/50" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link2Off className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[14px] text-foreground">Link restriction</p>
                <p className="text-[11px] text-muted-foreground">외부 링크 제한 설정 (클라이언트)</p>
              </div>
            </div>
            <button
              onClick={() =>
                setConfig((prev) => ({ ...prev, linkRestriction: !prev.linkRestriction }))
              }
              className={`w-10 h-[22px] rounded-full transition relative ${
                config.linkRestriction ? "bg-primary" : "bg-switch-background"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
                  config.linkRestriction ? "translate-x-[18px]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
        Sessions ({participants.length}) · active {stats.active} / restricted {stats.restricted} / kicked {stats.kicked}
      </p>

      {loading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-4 text-[12px] text-muted-foreground">
          불러오는 중...
        </div>
      ) : participants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-4 text-[12px] text-muted-foreground">
          참여자가 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.ParticipantID} className="bg-white rounded-2xl border border-border/50 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-[13px] text-muted-foreground shrink-0">
                    {participant.Nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] text-foreground">{participant.Nickname}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-lg ${statusColors[participant.Status]}`}>
                        {participant.Status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Joined via {participant.JoinedVia} · #{participant.ParticipantID}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {participant.Status !== "restricted" && participant.Status !== "kicked" && (
                    <button
                      onClick={() => setShowModal({ participant, action: "restrict" })}
                      className="p-2 rounded-xl hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition"
                      title="Restrict"
                    >
                      <ShieldOff className="w-4 h-4" />
                    </button>
                  )}
                  {participant.Status !== "kicked" ? (
                    <button
                      onClick={() => setShowModal({ participant, action: "kick" })}
                      className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-600 transition"
                      title="Kick"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowModal({ participant, action: "activate" })}
                      className="p-2 rounded-xl hover:bg-green-50 text-muted-foreground hover:text-green-600 transition"
                      title="Activate"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setShowModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-[16px] text-foreground mb-1.5">Confirm Action</h3>
            <p className="text-[14px] text-muted-foreground mb-5">
              {showModal.participant.Nickname} 사용자를 {showModal.action} 상태로 변경할까요?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 py-2.5 rounded-xl text-[14px] bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={applyAction}
                className={`flex-1 py-2.5 rounded-xl text-[14px] text-white transition ${
                  showModal.action === "kick"
                    ? "bg-destructive hover:bg-red-700"
                    : showModal.action === "restrict"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-primary hover:bg-green-700"
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
