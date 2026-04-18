import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Pin, Search } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, type FeedPost } from "../../lib/api";
import { useSelectedSpaceId } from "../../lib/admin-session";

type Filter = "All" | "Published" | "Draft" | "Pinned";

export function AdminPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedSpaceId = useSelectedSpaceId();

  async function loadPosts() {
    if (!selectedSpaceId) {
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getFeedPosts({ spaceId: selectedSpaceId });
      setPosts(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "게시글 목록 조회 실패";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [selectedSpaceId]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const hitSearch = !search || post.Title.toLowerCase().includes(search.toLowerCase());
      if (!hitSearch) return false;
      if (filter === "All") return true;
      if (filter === "Published") return post.IsPublished;
      if (filter === "Draft") return !post.IsPublished;
      return post.IsPinned;
    });
  }, [filter, posts, search]);

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto lg:mx-0">
      <Toaster position="top-center" richColors />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[20px] text-foreground">Posts</h2>
          <p className="text-[12px] text-muted-foreground">
            총 {posts.length}개 · draft {posts.filter((post) => !post.IsPublished).length}개
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/create")}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-[14px]"
        >
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {!selectedSpaceId && (
        <div className="mb-4 rounded-xl bg-blue-50 text-blue-800 px-3 py-2 text-[12px]">
          선택된 Space가 없습니다. 상단에서 Space를 선택하거나 먼저 생성해 주세요.
        </div>
      )}

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search posts..."
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 no-scrollbar">
        {(["All", "Published", "Draft", "Pinned"] as Filter[]).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-3 py-1.5 rounded-xl text-[12px] whitespace-nowrap ${
              filter === option
                ? "bg-primary text-white"
                : "bg-white border border-border text-muted-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {loading && <p className="text-[13px] text-muted-foreground">불러오는 중...</p>}
      <div className="space-y-2">
        {!loading &&
          filtered.map((post) => (
            <button
              key={post.FeedPostID}
              onClick={() => navigate(`/admin/create?postId=${post.FeedPostID}`)}
              className="w-full bg-white rounded-2xl border border-border/50 p-4 text-left hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {post.IsPinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                    <span className="text-[14px] text-foreground line-clamp-1">{post.Title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-lg">
                      {post.PostType}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-lg ${
                        post.IsPublished
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {post.IsPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(post.UpdatedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}

