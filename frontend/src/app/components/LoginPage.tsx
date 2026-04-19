import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarDays, MapPin, Eye, UserRound, Monitor, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, type Space } from "../lib/api";
import {
  setGuestParticipant,
  setParticipantFromJoin,
} from "../lib/participant-session";

function formatDateRange() {
  return "Now accepting attendees";
}

function distanceInKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earthRadiusKm * c;
}

function getCurrentPosition() {
  return new Promise<{ lat: number; lng: number } | null>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 2500,
        maximumAge: 1000 * 60 * 10,
      },
    );
  });
}

export function LoginPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [loadingSpace, setLoadingSpace] = useState(true);
  const [joining, setJoining] = useState(false);

  const selectedSpace = useMemo(
    () => spaces.find((space) => space.SpaceID === selectedSpaceId) || null,
    [spaces, selectedSpaceId],
  );

  useEffect(() => {
    async function loadSpace() {
      try {
        const [allSpaces, currentPosition] = await Promise.all([
          api.getSpaces(),
          getCurrentPosition(),
        ]);
        setSpaces(allSpaces);

        const activeSpaces = allSpaces
          .filter((space) => space.Status === "active")
          .sort(
            (a, b) =>
              new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime(),
          );

        const fallbackSpaces = allSpaces
          .filter((space) => space.Status !== "archived")
          .sort(
            (a, b) =>
              new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime(),
          );

        const activeSpacesWithGeo =
          currentPosition === null
            ? []
            : activeSpaces
                .filter(
                  (space) =>
                    typeof space.Latitude === "number" &&
                    Number.isFinite(space.Latitude) &&
                    typeof space.Longitude === "number" &&
                    Number.isFinite(space.Longitude),
                )
                .sort((a, b) => {
                  const distanceA = distanceInKm(currentPosition, {
                    lat: a.Latitude as number,
                    lng: a.Longitude as number,
                  });
                  const distanceB = distanceInKm(currentPosition, {
                    lat: b.Latitude as number,
                    lng: b.Longitude as number,
                  });
                  return distanceA - distanceB;
                });

        const primarySpace =
          activeSpacesWithGeo[0] || activeSpaces[0] || fallbackSpaces[0] || null;
        setSelectedSpaceId(primarySpace?.SpaceID || null);
        setJoinCode(primarySpace?.JoinCode || "");
      } catch (error) {
        const message = error instanceof Error ? error.message : "행사 정보를 불러오지 못했습니다.";
        toast.error(message);
      } finally {
        setLoadingSpace(false);
      }
    }

    loadSpace();
  }, []);

  useEffect(() => {
    // 네트워크 지연으로 화면이 계속 잠기지 않도록 안전장치
    const id = window.setTimeout(() => {
      setLoadingSpace(false);
    }, 2500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!selectedSpace) return;
    setJoinCode(selectedSpace.JoinCode);
  }, [selectedSpace?.SpaceID]);

  const resolvedNickname = useMemo(() => {
    if (nickname.trim()) return nickname.trim();
    return `Anonymous #${Math.floor(1000 + Math.random() * 9000)}`;
  }, [nickname]);

  const handleAnonymousEnter = async () => {
    if (!joinCode.trim()) {
      toast.error("입장 코드를 입력해 주세요.");
      return;
    }

    try {
      setJoining(true);
      const space = await api.getSpaceByJoinCode(joinCode.trim());
      const participant = await api.joinParticipant({
        joinCode: joinCode.trim(),
        nickname: resolvedNickname,
        joinedVia: "code",
        entryCodeInput: joinCode.trim(),
      });
      setParticipantFromJoin(participant, space);
      toast.success(`${participant.Nickname}님, 입장 완료`);
      navigate("/pwa/feed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "입장에 실패했습니다.";
      toast.error(message);
    } finally {
      setJoining(false);
    }
  };

  const handleGuestBrowse = async () => {
    try {
      const activeSpaces = spaces.filter((space) => space.Status === "active");
      const fallbackSpaces = spaces.filter((space) => space.Status !== "archived");
      const space = selectedSpace || activeSpaces[0] || fallbackSpaces[0];
      if (!space) {
        toast.error("Space가 없습니다. 관리자에서 Space를 먼저 생성해 주세요.");
        return;
      }
      setGuestParticipant(space);
      navigate("/pwa/feed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "게스트 입장에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-primary text-[11px] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Rapical Live Entry
          </div>
          <h1 className="text-[36px] tracking-tight text-primary">Rapicial</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Anonymous attendee entry</p>
        </div>

        <div className="surface-card p-5 mb-6">
          <p className="text-[10px] text-primary bg-accent inline-block px-2 py-0.5 rounded-full mb-2">
            {selectedSpace
              ? selectedSpace.Status === "active"
                ? "Live Now"
                : selectedSpace.Status.toUpperCase()
              : "Waiting"}
          </p>
          <h2 className="text-[17px] text-foreground">
            {selectedSpace?.SpaceName || (loadingSpace ? "행사 정보를 불러오는 중..." : "사용 가능한 Space가 없습니다")}
          </h2>
          {spaces.length > 1 && (
            <div className="mt-2">
              <label className="text-[11px] text-muted-foreground">행사 선택</label>
              <select
                value={selectedSpaceId ?? ""}
                onChange={(event) => setSelectedSpaceId(Number(event.target.value))}
                className="mt-1 w-full h-9 px-3 rounded-xl bg-input-background border border-border text-[12px]"
              >
                {spaces.map((space) => (
                  <option key={space.SpaceID} value={space.SpaceID}>
                    {space.SpaceName} ({space.Status})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-2.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[12px]">
                {formatDateRange()} · 기준: GPS 근접 active 우선, 이후 최신 업데이트 순
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[12px]">
                {selectedSpace?.HostName || selectedSpace?.Description || "행사 설명이 없습니다."}
              </span>
            </div>
          </div>
        </div>

        <div className="surface-card p-5 space-y-3">
          <div>
            <label className="text-[12px] text-muted-foreground mb-1.5 block">Join Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="예: TEST01"
              className="w-full h-11 px-4 rounded-xl bg-input-background border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-1.5 block">
              Nickname (optional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="비워두면 Anonymous로 입장"
              className="w-full h-11 px-4 rounded-xl bg-input-background border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            onClick={handleAnonymousEnter}
            disabled={joining}
            className="w-full h-12 flex items-center justify-center gap-2.5 bg-primary text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition disabled:opacity-50 shadow-[0_10px_24px_rgba(22,163,74,0.3)]"
          >
            <UserRound className="w-[18px] h-[18px]" />
            <span className="text-[14px]">{joining ? "입장 중..." : "익명으로 참여하기"}</span>
          </button>

          <button
            onClick={handleGuestBrowse}
            disabled={joining}
            className="w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-border rounded-xl text-muted-foreground hover:text-foreground active:scale-[0.98] transition disabled:opacity-50"
          >
            <Eye className="w-[18px] h-[18px]" />
            <span className="text-[14px]">
              {loadingSpace ? "게스트로 둘러보기 (준비 중)" : "게스트로 둘러보기"}
            </span>
          </button>
        </div>

        <div className="text-center mt-6 mb-4 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/demo")}
            className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:text-green-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Demo Mode
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/60 hover:text-muted-foreground transition"
          >
            <Monitor className="w-3.5 h-3.5" />
            Admin Console
          </button>
        </div>
      </div>
    </div>
  );
}
