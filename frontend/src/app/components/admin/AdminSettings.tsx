import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, type Space, type AdminSession } from "../../lib/api";
import {
  getAdminSession,
  setSelectedSpaceId,
  useSelectedSpaceId,
} from "../../lib/admin-session";

function generateJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateQrToken() {
  return `qr-${crypto.randomUUID()}`;
}

export function AdminSettings() {
  const admin = getAdminSession();
  const selectedSpaceId = useSelectedSpaceId();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [admins, setAdmins] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");
  const [newHostName, setNewHostName] = useState("");
  const [newStatus, setNewStatus] = useState<Space["Status"]>("draft");

  const selectedSpace = useMemo(
    () => spaces.find((space) => space.SpaceID === selectedSpaceId) || null,
    [spaces, selectedSpaceId],
  );

  async function load() {
    if (!admin) return;
    setLoading(true);
    try {
      const [spaceData, adminData] = await Promise.all([
        api.getSpaces({ createdBy: admin.AdminID }),
        api.getAdmins(),
      ]);
      setSpaces(spaceData);
      setAdmins(adminData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "설정 정보 조회 실패";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [admin?.AdminID]);

  const createNewSpace = async () => {
    if (!admin) {
      toast.error("관리자 세션이 없습니다.");
      return;
    }
    if (!newSpaceName.trim()) {
      toast.error("이벤트 이름을 입력해 주세요.");
      return;
    }

    try {
      setSaving(true);
      const created = await api.createSpace({
        SpaceName: newSpaceName.trim(),
        Description: newSpaceDesc.trim() || null,
        HostName: newHostName.trim() || null,
        JoinCode: generateJoinCode(),
        QrToken: generateQrToken(),
        CreatedBy: admin.AdminID,
      });
      await api.updateSpace(created.SpaceID, { Status: newStatus });
      toast.success("새 이벤트가 생성되었습니다.");
      setNewSpaceName("");
      setNewSpaceDesc("");
      setNewHostName("");
      setSelectedSpaceId(created.SpaceID);
      load();
    } catch (error) {
      const message = error instanceof Error ? error.message : "이벤트 생성 실패";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const updateCurrentSpace = async (body: Partial<Space>) => {
    if (!selectedSpace) return;
    const previous = selectedSpace;
    setSpaces((prev) =>
      prev.map((space) =>
        space.SpaceID === selectedSpace.SpaceID ? { ...space, ...body } : space,
      ),
    );
    try {
      await api.updateSpace(selectedSpace.SpaceID, body);
      toast.success("설정이 저장되었습니다.");
      load();
    } catch (error) {
      setSpaces((prev) =>
        prev.map((space) =>
          space.SpaceID === previous.SpaceID ? previous : space,
        ),
      );
      const message = error instanceof Error ? error.message : "설정 저장 실패";
      toast.error(message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:mx-0">
      <Toaster position="top-center" richColors />
      <h2 className="text-[20px] text-foreground mb-1">Settings</h2>
      <p className="text-[12px] text-muted-foreground mb-6">Event space configuration</p>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Create Event</p>
            <button
              onClick={createNewSpace}
              disabled={saving}
              className="flex items-center gap-1 text-[12px] text-primary disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> {saving ? "Creating..." : "Create"}
            </button>
          </div>

          <div className="p-4 space-y-2">
            <input
              type="text"
              value={newSpaceName}
              onChange={(event) => setNewSpaceName(event.target.value)}
              placeholder="Event name"
              className="w-full h-10 px-3 rounded-xl bg-input-background border border-border text-[14px]"
            />
            <input
              type="text"
              value={newHostName}
              onChange={(event) => setNewHostName(event.target.value)}
              placeholder="Host name"
              className="w-full h-10 px-3 rounded-xl bg-input-background border border-border text-[14px]"
            />
            <textarea
              value={newSpaceDesc}
              onChange={(event) => setNewSpaceDesc(event.target.value)}
              rows={2}
              placeholder="Description"
              className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-[14px] resize-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">Initial status</span>
              <select
                value={newStatus}
                onChange={(event) => setNewStatus(event.target.value as Space["Status"])}
                className="h-9 px-3 rounded-xl bg-input-background border border-border text-[13px]"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="ended">ended</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Current Event</p>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <p className="text-[12px] text-muted-foreground">불러오는 중...</p>
            ) : !selectedSpace ? (
              <p className="text-[12px] text-muted-foreground">선택된 이벤트가 없습니다.</p>
            ) : (
              <>
                <div>
                  <p className="text-[11px] text-muted-foreground">Space name</p>
                  <p className="text-[14px] text-foreground">{selectedSpace.SpaceName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">Status</span>
                  <select
                    value={selectedSpace.Status}
                    onChange={(event) =>
                      updateCurrentSpace({ Status: event.target.value as Space["Status"] })
                    }
                    className="h-9 px-3 rounded-xl bg-input-background border border-border text-[13px]"
                  >
                    <option value="draft">draft</option>
                    <option value="active">active</option>
                    <option value="ended">ended</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Join code</p>
                    <p className="text-[18px] text-foreground tracking-[0.2em]">
                      {selectedSpace.JoinCode}
                    </p>
                  </div>
                  <button
                    onClick={() => updateCurrentSpace({ JoinCode: generateJoinCode() })}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Rotate join code"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide">
              Team ({admins.length})
            </p>
          </div>
          {admins.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-muted-foreground">
              팀 정보가 없습니다.
            </div>
          ) : (
            admins.map((item) => (
              <div
                key={item.AdminID}
                className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[12px] text-primary">
                    {item.AdminName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[14px] text-foreground">{item.AdminName}</p>
                    <p className="text-[11px] text-muted-foreground">{item.Email}</p>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {item.Role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
