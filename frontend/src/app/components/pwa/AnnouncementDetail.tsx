import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { TopAppBar } from "./TopAppBar";
import { BottomTabBar } from "./BottomTabBar";
import { Pin } from "lucide-react";
import { api, type FeedPost } from "../../lib/api";

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

export function AnnouncementDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReactions, setActiveReactions] = useState<string[]>([]);

  useEffect(() => {
    async function loadPost() {
      if (!id) return;
      try {
        const data = await api.getFeedPostById(Number(id));
        setPost(data);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopAppBar title="Announcement" showBack />

      <div className="max-w-[500px] mx-auto px-4 pt-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 text-[14px] text-muted-foreground">
            불러오는 중...
          </div>
        ) : !post ? (
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 text-[14px] text-muted-foreground">
            게시글을 찾을 수 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.IsPinned && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-primary bg-accent px-1.5 py-0.5 rounded-lg">
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-lg">
                {post.PostType.toUpperCase()}
              </span>
            </div>

            <h2 className="text-[20px] text-foreground">{post.Title}</h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              Published {toTimeLabel(post.PublishedAt || post.CreatedAt)}
            </p>

            <div className="mt-5 whitespace-pre-wrap text-[14px] text-foreground/90 leading-relaxed">
              {post.BodyText}
            </div>

            <div className="flex items-center gap-2 mt-5">
              {["👍", "✅", "🔥"].map((emoji) => {
                const isActive = activeReactions.includes(emoji);
                return (
                  <button
                    key={emoji}
                    onClick={() =>
                      setActiveReactions((prev) =>
                        prev.includes(emoji)
                          ? prev.filter((entry) => entry !== emoji)
                          : [...prev, emoji],
                      )
                    }
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] transition ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>{emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}
