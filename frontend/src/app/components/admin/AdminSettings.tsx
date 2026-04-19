import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, type Space, type AdminSession } from "../../lib/api";
import {
  clearSelectedSpaceId,
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

function parseCoordinatesFromText(text: string): { lat: number; lng: number } | null {
  const input = text.trim();
  if (!input) return null;

  // 1) Plain "lat,lng"
  const plain = input.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (plain) {
    const lat = Number(plain[1]);
    const lng = Number(plain[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  // 2) Google Maps URL style ".../@lat,lng,17z"
  const atCoords = input.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (atCoords) {
    const lat = Number(atCoords[1]);
    const lng = Number(atCoords[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  // 3) Google Maps URL style with !3dLAT!4dLNG
  const googleTagged = input.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (googleTagged) {
    const lat = Number(googleTagged[1]);
    const lng = Number(googleTagged[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  return null;
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
  const [newLatitude, setNewLatitude] = useState("");
  const [newLongitude, setNewLongitude] = useState("");
  const [newLocationInput, setNewLocationInput] = useState("");
  const [newStatus, setNewStatus] = useState<Space["Status"]>("draft");
  const [spaceLatitude, setSpaceLatitude] = useState("");
  const [spaceLongitude, setSpaceLongitude] = useState("");
  const [spaceLocationInput, setSpaceLocationInput] = useState("");
  const [resolvingNewLocation, setResolvingNewLocation] = useState(false);
  const [resolvingCurrentLocation, setResolvingCurrentLocation] = useState(false);

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

  useEffect(() => {
    setSpaceLatitude(
      selectedSpace?.Latitude !== null && selectedSpace?.Latitude !== undefined
        ? String(selectedSpace.Latitude)
        : "",
    );
    setSpaceLongitude(
      selectedSpace?.Longitude !== null && selectedSpace?.Longitude !== undefined
        ? String(selectedSpace.Longitude)
        : "",
    );
    setSpaceLocationInput(
      selectedSpace?.Latitude !== null &&
        selectedSpace?.Latitude !== undefined &&
        selectedSpace?.Longitude !== null &&
        selectedSpace?.Longitude !== undefined
        ? `${selectedSpace.Latitude}, ${selectedSpace.Longitude}`
        : "",
    );
  }, [selectedSpace?.SpaceID, selectedSpace?.Latitude, selectedSpace?.Longitude]);

  const fillWithBrowserLocation = async (target: "new" | "current") => {
    const setResolving =
      target === "new" ? setResolvingNewLocation : setResolvingCurrentLocation;
    setResolving(true);
    try {
      if (!navigator.geolocation) {
        toast.error("브라우저에서 위치 기능을 지원하지 않습니다.");
        return;
      }
      const coords = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          reject,
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 1000 * 60 * 3 },
        );
      });

      const lat = String(coords.lat);
      const lng = String(coords.lng);
      if (target === "new") {
        setNewLatitude(lat);
        setNewLongitude(lng);
        setNewLocationInput(`${lat}, ${lng}`);
      } else {
        setSpaceLatitude(lat);
        setSpaceLongitude(lng);
        setSpaceLocationInput(`${lat}, ${lng}`);
      }
      toast.success("현재 위치 좌표를 입력했습니다.");
    } catch {
      toast.error("현재 위치를 가져오지 못했습니다. 권한 허용 후 다시 시도해 주세요.");
    } finally {
      setResolving(false);
    }
  };

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
        Latitude:
          newLatitude.trim() && Number.isFinite(Number(newLatitude))
            ? Number(newLatitude)
            : null,
        Longitude:
          newLongitude.trim() && Number.isFinite(Number(newLongitude))
            ? Number(newLongitude)
            : null,
        JoinCode: generateJoinCode(),
        QrToken: generateQrToken(),
        CreatedBy: admin.AdminID,
      });
      await api.updateSpace(created.SpaceID, { Status: newStatus });
      toast.success("새 이벤트가 생성되었습니다.");
      setNewSpaceName("");
      setNewSpaceDesc("");
      setNewHostName("");
      setNewLatitude("");
      setNewLongitude("");
      setNewLocationInput("");
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

  const closeCurrentSpace = async () => {
    if (!selectedSpace) return;
    const confirmed = window.confirm(
      `"${selectedSpace.SpaceName}" 행사를 종료(Closed) 처리할까요?`,
    );
    if (!confirmed) return;
    await updateCurrentSpace({ Status: "ended" });
  };

  const deleteCurrentSpace = async () => {
    if (!selectedSpace) return;
    const confirmed = window.confirm(
      `"${selectedSpace.SpaceName}" 행사를 완전히 삭제할까요?\n질문/답변/참여자/게시글 데이터도 함께 삭제됩니다.`,
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      const deletedSpaceId = selectedSpace.SpaceID;
      await api.deleteSpace(deletedSpaceId);
      toast.success("이벤트가 삭제되었습니다.");

      const nextSpaces = spaces.filter((space) => space.SpaceID !== deletedSpaceId);
      setSpaces(nextSpaces);
      if (nextSpaces.length > 0) {
        const active = nextSpaces.find((space) => space.Status === "active") || nextSpaces[0];
        setSelectedSpaceId(active.SpaceID);
      } else {
        clearSelectedSpaceId();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "이벤트 삭제 실패";
      toast.error(message);
    } finally {
      setSaving(false);
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
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newLocationInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setNewLocationInput(value);
                  const parsed = parseCoordinatesFromText(value);
                  if (parsed) {
                    setNewLatitude(String(parsed.lat));
                    setNewLongitude(String(parsed.lng));
                  }
                }}
                placeholder="위치 입력(좌표/지도 링크 붙여넣기)"
                className="col-span-2 w-full h-10 px-3 rounded-xl bg-input-background border border-border text-[14px]"
              />
              <button
                type="button"
                onClick={() => fillWithBrowserLocation("new")}
                disabled={resolvingNewLocation}
                className="h-10 px-3 rounded-xl bg-muted text-foreground text-[12px] disabled:opacity-50"
              >
                {resolvingNewLocation ? "위치 확인 중..." : "현재 위치 자동입력"}
              </button>
              <div className="h-10 px-3 rounded-xl bg-muted/50 border border-border text-[12px] text-muted-foreground flex items-center">
                {newLatitude && newLongitude
                  ? `좌표: ${newLatitude}, ${newLongitude}`
                  : "좌표 미입력"}
              </div>
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
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={spaceLocationInput}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSpaceLocationInput(value);
                      const parsed = parseCoordinatesFromText(value);
                      if (parsed) {
                        setSpaceLatitude(String(parsed.lat));
                        setSpaceLongitude(String(parsed.lng));
                      }
                    }}
                    placeholder="위치 입력(좌표/지도 링크 붙여넣기)"
                    className="col-span-2 w-full h-10 px-3 rounded-xl bg-input-background border border-border text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => fillWithBrowserLocation("current")}
                    disabled={resolvingCurrentLocation}
                    className="h-10 px-3 rounded-xl bg-muted text-foreground text-[12px] disabled:opacity-50"
                  >
                    {resolvingCurrentLocation ? "위치 확인 중..." : "현재 위치 자동입력"}
                  </button>
                  <div className="h-10 px-3 rounded-xl bg-muted/50 border border-border text-[12px] text-muted-foreground flex items-center">
                    {spaceLatitude && spaceLongitude
                      ? `좌표: ${spaceLatitude}, ${spaceLongitude}`
                      : "좌표 미입력"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const latitude =
                      spaceLatitude.trim() === "" ? null : Number(spaceLatitude);
                    const longitude =
                      spaceLongitude.trim() === "" ? null : Number(spaceLongitude);
                    if (
                      (latitude !== null && !Number.isFinite(latitude)) ||
                      (longitude !== null && !Number.isFinite(longitude))
                    ) {
                      toast.error("좌표는 숫자 형식으로 입력해 주세요.");
                      return;
                    }
                    updateCurrentSpace({ Latitude: latitude, Longitude: longitude });
                  }}
                  className="h-9 px-3 rounded-xl bg-muted text-foreground text-[12px] w-fit"
                >
                  GPS 좌표 저장
                </button>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={closeCurrentSpace}
                    disabled={saving || selectedSpace.Status === "ended"}
                    className="h-9 px-3 rounded-xl bg-amber-50 text-amber-700 text-[12px] disabled:opacity-50"
                  >
                    {selectedSpace.Status === "ended" ? "이미 Closed" : "행사 Closed 처리"}
                  </button>
                  <button
                    onClick={deleteCurrentSpace}
                    disabled={saving}
                    className="h-9 px-3 rounded-xl bg-red-50 text-red-700 text-[12px] disabled:opacity-50"
                  >
                    행사 삭제
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
