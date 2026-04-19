import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TopAppBar } from "./TopAppBar";
import { BottomTabBar } from "./BottomTabBar";
import { ChevronRight, CheckCircle, Send, MessageCircleQuestion } from "lucide-react";
import { toast, Toaster } from "sonner";
import { EmptyState } from "../shared/EmptyState";
import { api, type FeedPost } from "../../lib/api";
import { getParticipantSession } from "../../lib/participant-session";

const categories = ["Schedule", "Booth", "Lost & Found", "Location", "Ticket", "Other"];
const exampleQuestions = [
  "불꽃놀이는 몇 시에 시작하나요?",
  "Gate B는 어디에 있나요?",
  "분실물은 어디에 문의하나요?",
  "재입장 가능한가요?",
];

export function AskScreen() {
  const navigate = useNavigate();
  const participantSession = getParticipantSession();
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [faqPosts, setFaqPosts] = useState<FeedPost[]>([]);
  const [alreadyAsked, setAlreadyAsked] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadFaqs() {
      if (!participantSession?.SpaceID) return;
      const [faqData, myQuestions] = await Promise.all([
        api.getFeedPosts({
          spaceId: participantSession.SpaceID,
          postType: "faq",
          isPublished: true,
        }),
        participantSession.ParticipantID
          ? api.getQuestions({
              spaceId: participantSession.SpaceID,
              participantId: participantSession.ParticipantID,
            })
          : Promise.resolve([]),
      ]);
      setFaqPosts(faqData);
      setAlreadyAsked(myQuestions.length > 0);
    }

    loadFaqs();
  }, [participantSession?.SpaceID]);

  const suggestions = useMemo(() => {
    if (question.trim().length < 2) return [];
    const q = question.toLowerCase();
    return faqPosts
      .filter(
        (item) =>
          item.Title.toLowerCase().includes(q) || item.BodyText.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [faqPosts, question]);

  const handleSend = async () => {
    if (!participantSession?.ParticipantID || !participantSession.SpaceID) {
      toast.error("익명 참여 후 질문할 수 있습니다.");
      return;
    }
    if (!question.trim()) {
      toast.error("질문을 입력해 주세요.");
      return;
    }
    if (!title.trim()) {
      toast.error("질문 제목을 입력해 주세요.");
      return;
    }
    if (alreadyAsked) {
      toast.error("이 이벤트에서는 질문을 1회만 보낼 수 있습니다.");
      return;
    }

    try {
      setSending(true);
      await api.createQuestion({
        SpaceID: participantSession.SpaceID,
        ParticipantID: participantSession.ParticipantID,
        Title: selectedCategory
          ? `[${selectedCategory}] ${title.trim()}`
          : title.trim(),
        BodyText: question.trim(),
        IsPrivate: true,
      });
      toast.success("질문을 전송했습니다.", { description: "My Q에서 답변을 확인하세요." });
      navigate("/pwa/my-q");
    } catch (error) {
      const message = error instanceof Error ? error.message : "질문 전송 실패";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  if (!participantSession?.ParticipantID) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <TopAppBar title="Ask" />
        <EmptyState
          icon={MessageCircleQuestion}
          title="익명 참여 후 질문할 수 있어요"
          description="Join Code로 입장하면 관리자에게 질문을 보낼 수 있습니다."
          action={{ label: "입장하러 가기", onClick: () => navigate("/") }}
        />
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Toaster position="top-center" richColors />
      <TopAppBar title="Ask" />

      <div className="app-screen pt-4">
        <div className="surface-card p-4">
          <input
            placeholder="질문 제목"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-input-background border border-border text-[14px] mb-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            placeholder="질문을 입력하세요..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            className="w-full resize-none text-[14px] placeholder:text-muted-foreground/50 focus:outline-none bg-transparent leading-relaxed"
          />
        </div>

        {question.length === 0 && (
          <div className="mt-3">
            <p className="text-[11px] text-muted-foreground mb-1.5 px-0.5">예시 질문</p>
            <div className="flex flex-wrap gap-1.5">
              {exampleQuestions.map((example) => (
                <button
                  key={example}
                  onClick={() => setQuestion(example)}
                  className="px-3 py-1.5 rounded-xl text-[12px] bg-white border border-border/70 text-foreground"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(selectedCategory === category ? null : category)
              }
              className={`px-3 py-1.5 rounded-xl text-[12px] transition ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-white border border-border/80 text-muted-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {suggestions.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] text-muted-foreground mb-2 px-0.5 uppercase tracking-wider">
              Suggested Answers
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.map((faq) => (
                <div
                  key={faq.FeedPostID}
                  className="surface-card p-3.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-primary bg-accent px-1.5 py-0.5 rounded-lg">
                      FAQ
                    </span>
                  </div>
                  <p className="text-[14px] text-foreground">{faq.Title}</p>
                  <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">
                    {faq.BodyText}
                  </p>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => navigate(`/pwa/feed/${faq.FeedPostID}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] bg-muted text-foreground"
                    >
                      Open <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => navigate(`/pwa/feed/${faq.FeedPostID}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] bg-accent text-primary"
                    >
                      <CheckCircle className="w-3 h-3" /> This solved it
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-14 left-0 right-0 bg-white/92 backdrop-blur-md border-t border-border/80 z-30 px-4 py-3">
        <div className="max-w-[540px] mx-auto flex gap-2">
          <button
            onClick={handleSend}
            disabled={!question.trim() || !title.trim() || sending || alreadyAsked}
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-primary text-white rounded-xl disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="text-[14px]">
              {alreadyAsked ? "질문 1회 사용 완료" : sending ? "Sending..." : "Send question"}
            </span>
          </button>
          <button
            onClick={() => navigate("/pwa/feed")}
            className="h-11 px-4 text-[13px] text-muted-foreground border border-border rounded-xl"
          >
            Cancel
          </button>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}
