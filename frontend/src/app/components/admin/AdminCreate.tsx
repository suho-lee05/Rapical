import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Eye, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api } from "../../lib/api";
import {
  getAdminSession,
  getSelectedSpaceId,
  setSelectedSpaceId,
} from "../../lib/admin-session";

export function AdminCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = Number(searchParams.get("postId") || 0);
  const admin = getAdminSession();
  const selectedSpaceId = getSelectedSpaceId();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"notice" | "faq">("notice");
  const [pinned, setPinned] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resolvedSpaceId, setResolvedSpaceId] = useState<number | null>(selectedSpaceId);

  const isEdit = useMemo(() => Number.isFinite(postId) && postId > 0, [postId]);

  useEffect(() => {
    async function loadPost() {
      if (!isEdit) return;
      try {
        const post = await api.getFeedPostById(postId);
        setTitle(post.Title);
        setContent(post.BodyText);
        setPostType(post.PostType);
        setPinned(post.IsPinned);
      } catch (error) {
        const message = error instanceof Error ? error.message : "게시글 조회 실패";
        toast.error(message);
      }
    }

    loadPost();
  }, [isEdit, postId]);

  useEffect(() => {
    async function ensureSpaceSelection() {
      if (selectedSpaceId) {
        setResolvedSpaceId(selectedSpaceId);
        return;
      }

      try {
        const spaces = await api.getSpaces();
        if (!spaces.length) {
          setResolvedSpaceId(null);
          return;
        }

        const activeSpace = spaces.find((space) => space.Status === "active") || spaces[0];
        setSelectedSpaceId(activeSpace.SpaceID);
        setResolvedSpaceId(activeSpace.SpaceID);
        toast.message(`기본 Space로 "${activeSpace.SpaceName}"가 선택되었습니다.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Space 조회 실패";
        toast.error(message);
      }
    }

    ensureSpaceSelection();
  }, [selectedSpaceId]);

  const savePost = async (publish: boolean) => {
    if (!admin) {
      toast.error("관리자 세션이 없습니다. 다시 로그인해 주세요.");
      return;
    }
    if (!resolvedSpaceId) {
      toast.error("선택된 Space가 없습니다. Space를 먼저 생성하거나 선택해 주세요.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해 주세요.");
      return;
    }

    try {
      setSaving(true);
      if (isEdit) {
        await api.updateFeedPost(postId, {
          Title: title,
          BodyText: content,
          PostType: postType,
          IsPinned: pinned,
          IsPublished: publish,
          PublishedAt: publish ? new Date().toISOString() : null,
        });
      } else {
        await api.createFeedPost({
          SpaceID: resolvedSpaceId,
          AuthorAdminID: admin.AdminID,
          PostType: postType,
          Title: title,
          BodyText: content,
          BodyJson: null,
          IsPinned: pinned,
          IsPublished: publish,
          PublishedAt: publish ? new Date().toISOString() : null,
        });
      }

      toast.success(publish ? "게시 완료" : "임시저장 완료");
      navigate("/admin/posts");
    } catch (error) {
      const message = error instanceof Error ? error.message : "저장 실패";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <Toaster position="top-center" richColors />
      <button
        onClick={() => navigate("/admin/posts")}
        className="flex items-center gap-1 text-[13px] text-muted-foreground mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <section className="bg-white rounded-2xl border border-border/50 p-4 space-y-4">
          {!admin && (
            <div className="rounded-xl bg-amber-50 text-amber-800 px-3 py-2 text-[12px]">
              관리자 세션이 없습니다. `/admin`에서 다시 로그인해 주세요.
            </div>
          )}
          {!resolvedSpaceId && (
            <div className="rounded-xl bg-blue-50 text-blue-800 px-3 py-2 text-[12px]">
              선택된 Space가 없습니다. `Spaces` 데이터가 있어야 게시글을 발행할 수 있습니다.
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Post title"
            className="w-full text-[20px] border-none focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setPostType("notice")}
              className={`px-3 py-1.5 rounded-xl text-[12px] ${
                postType === "notice" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              notice
            </button>
            <button
              onClick={() => setPostType("faq")}
              className={`px-3 py-1.5 rounded-xl text-[12px] ${
                postType === "faq" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              faq
            </button>
            <label className="ml-2 flex items-center gap-2 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
              />
              Pinned
            </label>
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={14}
            placeholder="Write your post..."
            className="w-full resize-none rounded-xl bg-input-background border border-border p-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex gap-2">
            <button
              disabled={saving}
              onClick={() => savePost(true)}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-[14px] disabled:opacity-50"
            >
              Publish
            </button>
            <button
              disabled={saving}
              onClick={() => savePost(false)}
              className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-[13px] disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              onClick={() => setShowPreview((prev) => !prev)}
              className="ml-auto flex items-center gap-1 text-[13px] text-muted-foreground"
            >
              <Eye className="w-4 h-4" /> {showPreview ? "Hide Preview" : "Preview"}
            </button>
          </div>
        </section>

        {showPreview && (
          <section className="bg-white rounded-2xl border border-border/50 p-4 h-fit sticky top-16">
            <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">Preview</p>
            <h3 className="text-[18px] text-foreground">{title || "Untitled"}</h3>
            <div className="flex gap-1.5 mt-2 mb-3">
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">
                {postType}
              </span>
              {pinned && (
                <span className="text-[10px] bg-accent text-primary px-1.5 py-0.5 rounded-lg">
                  Pinned
                </span>
              )}
            </div>
            <p className="text-[14px] text-foreground/80 whitespace-pre-wrap">
              {content || "내용을 입력하면 미리보기가 표시됩니다."}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

