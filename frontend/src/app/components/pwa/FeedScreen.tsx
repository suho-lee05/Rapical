import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Pin,
  ChevronRight,
  MessageCircleQuestion,
  Search as SearchIcon,
  Eye,
} from "lucide-react";
import { BottomTabBar } from "./BottomTabBar";
import { FeedSkeleton, PinnedSkeleton } from "../shared/SkeletonLoader";
import { EmptyState } from "../shared/EmptyState";
import { api, type FeedPost } from "../../lib/api";
import { getParticipantSession } from "../../lib/participant-session";

function toTimeLabel(date: string | null) {
  if (!date) return "just now";
  const now = Date.now();
  const target = new Date(date).getTime();
  const diff = Math.max(1, Math.floor((now - target) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const tagColor: Record<string, string> = {
  notice: "bg-blue-50 text-blue-600",
  faq: "bg-violet-50 text-violet-600",
};

export function FeedScreen() {
  const navigate = useNavigate();
  const participantSession = getParticipantSession();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReactions, setActiveReactions] = useState<Record<number, string[]>>({});

  useEffect(() => {
    async function loadFeed() {
      if (!participantSession?.SpaceID) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getFeedPosts({
          spaceId: participantSession.SpaceID,
          isPublished: true,
        });
        setPosts(data);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [participantSession?.SpaceID]);

  const pinnedPosts = useMemo(() => posts.filter((post) => post.IsPinned), [posts]);
  const latestPosts = useMemo(() => posts.filter((post) => !post.IsPinned), [posts]);

  const toggleReaction = (postId: number, emoji: string) => {
    setActiveReactions((prev) => {
      const current = prev[postId] || [];
      return {
        ...prev,
        [postId]: current.includes(emoji)
          ? current.filter((entry) => entry !== emoji)
          : [...current, emoji],
      };
    });
  };

  if (!participantSession?.SpaceID) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <EmptyState
          icon={Eye}
          title="참여 중인 Space가 없습니다"
          description="로그인 화면에서 Join Code로 익명 참여하거나 게스트로 입장해 주세요."
          action={{ label: "입장하러 가기", onClick: () => navigate("/") }}
        />
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="surface-header">
        <div className="app-screen flex items-center justify-between h-[52px]">
          <div>
            <h1 className="text-[16px] text-foreground tracking-tight">Announcements</h1>
            <p className="text-[11px] text-muted-foreground">
              {participantSession.SpaceName} · {participantSession.IsGuest ? "Guest" : participantSession.Nickname}
            </p>
          </div>
          <button
            onClick={() => navigate("/pwa/search")}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-lg transition"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="app-screen pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => navigate("/pwa/ask")}
            className="surface-card flex-1 py-3 text-center"
          >
            <span className="text-lg block">💬</span>
            <span className="text-[11px] text-foreground mt-0.5 block">Ask</span>
          </button>
          <button
            onClick={() => navigate("/pwa/my-q")}
            className="surface-card flex-1 py-3 text-center"
          >
            <span className="text-lg block">📥</span>
            <span className="text-[11px] text-foreground mt-0.5 block">My Q</span>
          </button>
        </div>

        <div className="mb-5">
          <p className="text-[11px] text-muted-foreground mb-2 px-0.5 uppercase tracking-wider flex items-center gap-1">
            <Pin className="w-3 h-3" /> Pinned
          </p>
          {loading ? (
            <PinnedSkeleton />
          ) : pinnedPosts.length === 0 ? (
            <div className="surface-card px-4 py-6 text-[13px] text-muted-foreground">
              아직 고정된 공지가 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pinnedPosts.map((post) => (
                <button
                  key={post.FeedPostID}
                  onClick={() => navigate(`/pwa/feed/${post.FeedPostID}`)}
                  className="surface-card w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="text-xl shrink-0">{post.PostType === "faq" ? "❓" : "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-foreground truncate">{post.Title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{post.BodyText}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] text-muted-foreground mb-2 px-0.5 uppercase tracking-wider">Latest</p>
          {loading ? (
            <FeedSkeleton count={4} />
          ) : latestPosts.length === 0 ? (
            <EmptyState
              icon={MessageCircleQuestion}
              title="게시된 공지가 없습니다"
              description="관리자가 공지를 발행하면 여기에 표시됩니다."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {latestPosts.map((post) => (
                <div
                  key={post.FeedPostID}
                  className="surface-card overflow-hidden"
                >
                  <button
                    onClick={() => navigate(`/pwa/feed/${post.FeedPostID}`)}
                    className="w-full text-left px-4 pt-3.5 pb-2"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-lg ${
                          tagColor[post.PostType] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {post.PostType.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">
                        {toTimeLabel(post.PublishedAt || post.CreatedAt)}
                      </span>
                    </div>

                    <h3 className="text-[14px] text-foreground mb-0.5">{post.Title}</h3>
                    <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.BodyText}
                    </p>

                    <div className="flex items-center gap-1 mt-1.5 text-[12px] text-primary/70">
                      <span>Read more</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 px-4 pb-3">
                    {["👍", "✅", "🔥"].map((emoji) => {
                      const isActive = (activeReactions[post.FeedPostID] || []).includes(emoji);
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(post.FeedPostID, emoji)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] transition ${
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted/70 text-muted-foreground"
                          }`}
                        >
                          <span className="text-[13px]">{emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/pwa/ask")}
        className="fixed bottom-20 right-4 lg:right-8 bg-primary text-white rounded-2xl px-4 py-3 shadow-[0_12px_28px_rgba(22,163,74,0.35)] flex items-center gap-2 z-40"
      >
        <MessageCircleQuestion className="w-4 h-4" />
        <span className="text-[13px]">Ask</span>
      </button>

      <BottomTabBar />
    </div>
  );
}
