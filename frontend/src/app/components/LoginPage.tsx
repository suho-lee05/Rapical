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

export function LoginPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [loadingSpace, setLoadingSpace] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadSpace() {
      try {
        const activeSpaces = await api.getSpaces({ status: "active" });
        const fallbackSpaces = activeSpaces.length ? activeSpaces : await api.getSpaces();
        const primarySpace = fallbackSpaces[0] || null;
        setActiveSpace(primarySpace);
        if (primarySpace) {
          setJoinCode(primarySpace.JoinCode);
        }
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
      const activeSpaces = await api.getSpaces({ status: "active" });
      const allSpaces = activeSpaces.length ? activeSpaces : await api.getSpaces();
      const space = activeSpace || allSpaces[0];
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
        <div className="text-center mb-8">
          <h1 className="text-[36px] tracking-tight text-primary">Rapicial</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Anonymous attendee entry</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/50 mb-6">
          <p className="text-[10px] text-primary bg-accent inline-block px-2 py-0.5 rounded-full mb-2">
            {activeSpace ? "Live Now" : "Waiting"}
          </p>
          <h2 className="text-[17px] text-foreground">
            {activeSpace?.SpaceName || (loadingSpace ? "행사 정보를 불러오는 중..." : "사용 가능한 Space가 없습니다")}
          </h2>
          <div className="mt-2.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[12px]">{formatDateRange()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[12px]">
                {activeSpace?.HostName || activeSpace?.Description || "행사 설명이 없습니다."}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 space-y-3">
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
            className="w-full h-12 flex items-center justify-center gap-2.5 bg-primary text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition disabled:opacity-50"
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
