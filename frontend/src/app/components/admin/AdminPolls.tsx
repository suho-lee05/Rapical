import { useEffect, useMemo, useState } from "react";
import { Plus, X, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, type FeedPost } from "../../lib/api";
import { getAdminSession, useSelectedSpaceId } from "../../lib/admin-session";

type PollMeta = {
  kind: "poll";
  options: string[];
  selectType: "single" | "multi";
  resultsPublic: boolean;
  closeAt: string | null;
};

function parsePollMeta(bodyJson: string | null): PollMeta | null {
  if (!bodyJson) return null;
  try {
    const parsed = JSON.parse(bodyJson);
    if (parsed?.kind !== "poll" || !Array.isArray(parsed?.options)) return null;
    return parsed as PollMeta;
  } catch {
    return null;
  }
}

export function AdminPolls() {
  const admin = getAdminSession();
  const spaceId = useSelectedSpaceId();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [selectType, setSelectType] = useState<"single" | "multi">("single");
  const [resultsPublic, setResultsPublic] = useState(true);
  const [closeHours, setCloseHours] = useState("2");
  const [saving, setSaving] = useState(false);
  const [pollPosts, setPollPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    const validOptions = options.filter((option) => option.trim()).length;
    return question.trim().length > 3 && validOptions >= 2;
  }, [options, question]);

  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (index: number) =>
    setOptions((prev) => prev.filter((_, current) => current !== index));
  const updateOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((item, current) => (current === index ? value : item)));

  async function loadPollPosts() {
    if (!spaceId) return;
    setLoading(true);
    try {
      const posts = await api.getFeedPosts({ spaceId });
      setPollPosts(posts.filter((post) => Boolean(parsePollMeta(post.BodyJson))));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Poll 목록 조회 실패";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPollPosts();
  }, [spaceId]);

  const handlePublish = async () => {
    if (!admin) {
      toast.error("관리자 세션이 없습니다.");
      return;
    }
    if (!spaceId) {
      toast.error("선택된 Space가 없습니다.");
      return;
    }
    if (!canSubmit) {
      toast.error("질문과 옵션(2개 이상)을 입력해 주세요.");
      return;
    }

    const trimmedOptions = options.map((item) => item.trim()).filter(Boolean);
    const hours = Number(closeHours || 0);
    const closeAt =
      Number.isFinite(hours) && hours > 0
        ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
        : null;

    const bodyJson = JSON.stringify({
      kind: "poll",
      options: trimmedOptions,
      selectType,
      resultsPublic,
      closeAt,
    } satisfies PollMeta);

    try {
      setSaving(true);
      await api.createFeedPost({
        SpaceID: spaceId,
        AuthorAdminID: admin.AdminID,
        PostType: "notice",
        Title: question.trim(),
        BodyText: "Poll",
        BodyJson: bodyJson,
        IsPublished: true,
        PublishedAt: new Date().toISOString(),
      });
      toast.success("Poll이 게시되었습니다.");
      setQuestion("");
      setOptions(["", ""]);
      setCloseHours("2");
      loadPollPosts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Poll 게시 실패";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto lg:mx-0">
      <Toaster position="top-center" richColors />
      <h2 className="text-[20px] text-foreground mb-1">Poll Builder</h2>
      <p className="text-[12px] text-muted-foreground mb-5">실제 게시글 기반 Poll 생성</p>

      <div className="bg-white rounded-2xl border border-border/50 p-4 space-y-5">
        <div>
          <label className="text-[12px] text-muted-foreground mb-1.5 block">Question</label>
          <input
            type="text"
            placeholder="예: 어느 스테이지로 이동하시나요?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-input-background border border-border text-[14px]"
          />
        </div>

        <div>
          <label className="text-[12px] text-muted-foreground mb-1.5 block">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground w-4 text-center tabular-nums">
                  {index + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-input-background border border-border text-[14px]"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addOption}
            className="flex items-center gap-1 mt-2 text-[12px] text-primary hover:text-green-700 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add option
          </button>
        </div>

        <div>
          <label className="text-[12px] text-muted-foreground mb-1.5 block">Selection</label>
          <div className="flex gap-2">
            {(["single", "multi"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectType(type)}
                className={`flex-1 py-2 rounded-xl text-[13px] transition ${
                  selectType === type ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {type === "single" ? "Single" : "Multi"} select
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[13px] text-foreground">Close after</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="168"
              value={closeHours}
              onChange={(event) => setCloseHours(event.target.value)}
              className="w-16 h-9 px-2 rounded-xl bg-input-background border border-border text-[14px] text-center tabular-nums"
            />
            <span className="text-[13px] text-muted-foreground">hours</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] text-foreground">Results public</span>
          <button
            onClick={() => setResultsPublic((prev) => !prev)}
            className={`w-10 h-[22px] rounded-full transition relative ${
              resultsPublic ? "bg-primary" : "bg-switch-background"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
                resultsPublic ? "translate-x-[18px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <button
        disabled={!canSubmit || saving}
        onClick={handlePublish}
        className="w-full mt-4 py-2.5 bg-primary text-white rounded-xl hover:bg-green-700 transition text-[14px] disabled:opacity-50"
      >
        {saving ? "Publishing..." : "Publish poll"}
      </button>

      <div className="mt-6 bg-white rounded-2xl border border-border/50 p-4">
        <h3 className="text-[15px] text-foreground mb-3">Published Polls</h3>
        {loading ? (
          <p className="text-[12px] text-muted-foreground">불러오는 중...</p>
        ) : pollPosts.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">게시된 Poll이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {pollPosts.map((post) => {
              const meta = parsePollMeta(post.BodyJson);
              return (
                <div key={post.FeedPostID} className="border border-border/50 rounded-xl p-3">
                  <p className="text-[14px] text-foreground">{post.Title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {meta?.options.length || 0} options · {meta?.selectType || "single"} select
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
