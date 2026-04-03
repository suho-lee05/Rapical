import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TopAppBar } from "./TopAppBar";
import { BottomTabBar } from "./BottomTabBar";
import { Search, ChevronRight } from "lucide-react";
import { api, type FeedPost } from "../../lib/api";
import { getParticipantSession } from "../../lib/participant-session";

const filterTags = ["All", "notice", "faq"];

export function SearchScreen() {
  const navigate = useNavigate();
  const participantSession = getParticipantSession();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [posts, setPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    async function loadPosts() {
      if (!participantSession?.SpaceID) return;
      const data = await api.getFeedPosts({
        spaceId: participantSession.SpaceID,
        isPublished: true,
      });
      setPosts(data);
    }

    loadPosts();
  }, [participantSession?.SpaceID]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery =
        !query.trim() ||
        post.Title.toLowerCase().includes(query.toLowerCase()) ||
        post.BodyText.toLowerCase().includes(query.toLowerCase());
      const matchesTag = activeTag === "All" || post.PostType === activeTag;
      return matchesQuery && matchesTag;
    });
  }, [activeTag, posts, query]);

  const pinned = filtered.filter((post) => post.IsPinned);
  const notices = filtered.filter((post) => !post.IsPinned && post.PostType === "notice");
  const faqs = filtered.filter((post) => !post.IsPinned && post.PostType === "faq");

  const ResultRow = ({ post }: { post: FeedPost }) => (
    <button
      onClick={() => navigate(`/pwa/feed/${post.FeedPostID}`)}
      className="w-full bg-white rounded-2xl border border-border/50 p-3.5 text-left hover:shadow-sm transition flex items-center justify-between"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-lg ${
              post.PostType === "faq" ? "bg-accent text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {post.PostType === "faq" ? "FAQ" : "Post"}
          </span>
        </div>
        <p className="text-[14px] text-foreground truncate">{post.Title}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 ml-2" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopAppBar title="Search" showBack />

      <div className="max-w-[500px] mx-auto px-4 pt-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search announcements & FAQs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            className="w-full h-11 pl-9 pr-4 rounded-xl bg-white border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-3 no-scrollbar">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-[12px] whitespace-nowrap transition ${
                activeTag === tag
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center pt-16 text-center">
            <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
            <p className="text-[14px] text-muted-foreground">No results found</p>
          </div>
        )}

        {pinned.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">Pinned</p>
            <div className="flex flex-col gap-2">
              {pinned.map((post) => (
                <ResultRow key={post.FeedPostID} post={post} />
              ))}
            </div>
          </div>
        )}

        {notices.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">Announcements</p>
            <div className="flex flex-col gap-2">
              {notices.map((post) => (
                <ResultRow key={post.FeedPostID} post={post} />
              ))}
            </div>
          </div>
        )}

        {faqs.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">FAQs</p>
            <div className="flex flex-col gap-2">
              {faqs.map((post) => (
                <ResultRow key={post.FeedPostID} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}
