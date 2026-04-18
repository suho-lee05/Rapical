import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { Reply } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { api, type Question, type QuestionMessage } from "../../lib/api";
import { getAdminSession, useSelectedSpaceId } from "../../lib/admin-session";
import {
  isRealtimeEnabled,
  subscribeToQuestionMessages,
  subscribeToSpaceQuestions,
} from "../../lib/supabase-realtime";

type Filter = "all" | "pending" | "answered" | "closed";

function mapToBadgeStatus(status: Question["Status"]) {
  if (status === "pending") return "new";
  if (status === "answered") return "answered";
  return "closed";
}

function matchFilter(status: Question["Status"], filter: Filter) {
  if (filter === "all") return true;
  if (filter === "pending") return status === "pending";
  if (filter === "answered") return status === "answered";
  return status === "closed" || status === "rejected";
}

function toTimeLabel(date: string) {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diff = Math.max(1, Math.floor((now - target) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const admin = getAdminSession();
  const [filter, setFilter] = useState<Filter>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [reply, setReply] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [sendingReply, setSendingReply] = useState(false);
  const selectedSpaceId = useSelectedSpaceId();

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.QuestionID === selectedQuestionId) || null,
    [questions, selectedQuestionId],
  );

  const filteredQuestions = useMemo(
    () => questions.filter((question) => matchFilter(question.Status, filter)),
    [filter, questions],
  );

  async function loadQuestions(silent = false) {
    if (!selectedSpaceId) {
      setQuestions([]);
      setSelectedQuestionId(null);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const data = await api.getQuestions({ spaceId: selectedSpaceId });
      setQuestions(data);
      if (!selectedQuestionId && data.length > 0) {
        setSelectedQuestionId(data[0].QuestionID);
      } else if (selectedQuestionId && !data.some((q) => q.QuestionID === selectedQuestionId)) {
        setSelectedQuestionId(data[0]?.QuestionID || null);
      }
    } catch (error) {
      if (!silent) {
        const message = error instanceof Error ? error.message : "문의 목록 조회 실패";
        toast.error(message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function loadMessages(questionId: number, silent = false) {
    try {
      const data = await api.getQuestionMessages(questionId);
      setMessages(data);
    } catch (error) {
      if (!silent) {
        const message = error instanceof Error ? error.message : "메시지 조회 실패";
        toast.error(message);
      }
    }
  }

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    loadQuestions(false);
  }, [admin, navigate, selectedSpaceId]);

  useEffect(() => {
    if (!selectedQuestionId) return;
    loadMessages(selectedQuestionId);
  }, [selectedQuestionId]);

  useEffect(() => {
    if (isRealtimeEnabled) return;
    if (!selectedSpaceId) return;
    const id = window.setInterval(() => {
      loadQuestions(true);
    }, 5000);
    return () => window.clearInterval(id);
  }, [selectedSpaceId]);

  useEffect(() => {
    if (isRealtimeEnabled) return;
    if (!selectedQuestionId) return;
    const id = window.setInterval(() => {
      loadMessages(selectedQuestionId, true);
    }, 2500);
    return () => window.clearInterval(id);
  }, [selectedQuestionId]);

  useEffect(() => {
    if (!selectedSpaceId || !isRealtimeEnabled) return;
    return subscribeToSpaceQuestions(selectedSpaceId, () => {
      loadQuestions(true);
    });
  }, [selectedSpaceId]);

  useEffect(() => {
    if (!selectedQuestionId || !isRealtimeEnabled) return;
    return subscribeToQuestionMessages(selectedQuestionId, () => {
      loadMessages(selectedQuestionId, true);
    });
  }, [selectedQuestionId]);

  const updateStatus = async (questionId: number, status: Question["Status"]) => {
    const previous = questions;
    setQuestions((prev) =>
      prev.map((question) =>
        question.QuestionID === questionId
          ? { ...question, Status: status, UpdatedAt: new Date().toISOString() }
          : question,
      ),
    );
    try {
      const updated = await api.updateQuestion(questionId, { Status: status });
      setQuestions((prev) =>
        prev.map((question) => (question.QuestionID === questionId ? updated : question)),
      );
      toast.success("상태가 업데이트되었습니다.");
    } catch (error) {
      setQuestions(previous);
      const message = error instanceof Error ? error.message : "상태 변경 실패";
      toast.error(message);
    }
  };

  const handleSendReply = async () => {
    if (!selectedQuestion) return;
    if (!admin) {
      toast.error("관리자 세션이 없습니다. 다시 로그인해 주세요.");
      return;
    }
    if (!selectedSpaceId) {
      toast.error("선택된 Space가 없습니다. 먼저 Space를 선택해 주세요.");
      return;
    }
    if (!reply.trim()) {
      toast.error("답변 내용을 입력해 주세요.");
      return;
    }

    const sendingText = reply.trim();
    const optimisticMessage: QuestionMessage = {
      QuestionMessageID: -Date.now(),
      QuestionID: selectedQuestion.QuestionID,
      SenderType: "admin",
      AdminID: admin.AdminID,
      ParticipantID: selectedQuestion.ParticipantID,
      MessageText: sendingText,
      IsInternalNote: false,
      CreatedAt: new Date().toISOString(),
    };

    try {
      setSendingReply(true);
      setReply("");
      setMessages((prev) => [...prev, optimisticMessage]);

      let patchBody: Partial<Question> = {
        Status: "answered",
        AssignedAdminID: admin.AdminID,
      };

      if (visibility === "public") {
        await api.createQuestionMessage({
          QuestionID: selectedQuestion.QuestionID,
          SenderType: "admin",
          AdminID: admin.AdminID,
          ParticipantID: selectedQuestion.ParticipantID,
          MessageText: sendingText,
        });
        const post = await api.createFeedPost({
          SpaceID: selectedSpaceId,
          AuthorAdminID: admin.AdminID,
          PostType: "faq",
          Title:
            selectedQuestion.Title || `Q${selectedQuestion.QuestionID} FAQ`,
          BodyText: sendingText,
          BodyJson: null,
          IsPublished: true,
          PublishedAt: new Date().toISOString(),
        });
        patchBody = { ...patchBody, PublishedFaqPostID: post.FeedPostID };
        await api.updateQuestion(selectedQuestion.QuestionID, patchBody);
      } else {
        await Promise.all([
          api.createQuestionMessage({
            QuestionID: selectedQuestion.QuestionID,
            SenderType: "admin",
            AdminID: admin.AdminID,
            ParticipantID: selectedQuestion.ParticipantID,
            MessageText: sendingText,
          }),
          api.updateQuestion(selectedQuestion.QuestionID, patchBody),
        ]);
      }
      loadMessages(selectedQuestion.QuestionID, true);
      loadQuestions(true);
      toast.success(visibility === "public" ? "FAQ로 발행되었습니다." : "답변이 전송되었습니다.");
    } catch (error) {
      setMessages((prev) =>
        prev.filter((message) => message.QuestionMessageID !== optimisticMessage.QuestionMessageID),
      );
      setReply(sendingText);
      const message = error instanceof Error ? error.message : "답변 전송 실패";
      toast.error(message);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <Toaster position="top-center" richColors />
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-120px)]">
        <section className="bg-white border border-border/50 rounded-2xl flex flex-col min-h-0">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-[20px] text-foreground">Inbox</h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              총 {questions.length}개 문의
            </p>
            {!selectedSpaceId && (
              <p className="text-[12px] text-blue-700 mt-2">
                선택된 Space가 없습니다. 상단에서 Space를 먼저 선택해 주세요.
              </p>
            )}
            <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
              {(["all", "pending", "answered", "closed"] as Filter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] whitespace-nowrap transition ${
                    filter === item
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-auto flex-1">
            {loading && <p className="p-4 text-[13px] text-muted-foreground">불러오는 중...</p>}
            {!loading &&
              filteredQuestions.map((question) => (
                <button
                  key={question.QuestionID}
                  onClick={() => setSelectedQuestionId(question.QuestionID)}
                  className={`w-full text-left px-4 py-3 border-b border-border/40 hover:bg-muted/30 transition ${
                    selectedQuestionId === question.QuestionID ? "bg-accent/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <StatusBadge status={mapToBadgeStatus(question.Status)} />
                    <span className="text-[11px] text-muted-foreground">
                      {toTimeLabel(question.CreatedAt)}
                    </span>
                  </div>
                  <p className="text-[14px] text-foreground line-clamp-2">
                    {question.Title || question.BodyText}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Participant #{question.ParticipantID}
                  </p>
                </button>
              ))}
          </div>
        </section>

        <section className="bg-white border border-border/50 rounded-2xl flex flex-col min-h-0">
          {!selectedQuestion ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-[14px]">
              문의를 선택해 주세요.
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <StatusBadge status={mapToBadgeStatus(selectedQuestion.Status)} />
                  <button
                    onClick={() => updateStatus(selectedQuestion.QuestionID, "pending")}
                    className="text-[11px] px-2 py-1 bg-amber-50 text-amber-700 rounded-lg"
                  >
                    pending
                  </button>
                  <button
                    onClick={() => updateStatus(selectedQuestion.QuestionID, "answered")}
                    className="text-[11px] px-2 py-1 bg-blue-50 text-blue-700 rounded-lg"
                  >
                    answered
                  </button>
                  <button
                    onClick={() => updateStatus(selectedQuestion.QuestionID, "closed")}
                    className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-lg"
                  >
                    closed
                  </button>
                </div>
                <h3 className="text-[18px] text-foreground mt-3">
                  {selectedQuestion.Title || "Untitled question"}
                </h3>
                <p className="text-[14px] text-muted-foreground mt-2 whitespace-pre-wrap">
                  {selectedQuestion.BodyText}
                </p>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-2">
                {messages.length === 0 && (
                  <p className="text-[12px] text-muted-foreground">메시지가 아직 없습니다.</p>
                )}
                {messages.map((message) => (
                  <div
                    key={message.QuestionMessageID}
                    className={`rounded-xl p-3 text-[13px] ${
                      message.SenderType === "admin"
                        ? "bg-accent text-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-[11px] text-muted-foreground mb-1">
                      {message.SenderType} · {toTimeLabel(message.CreatedAt)}
                    </p>
                    <p className="whitespace-pre-wrap">{message.MessageText}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border/50 space-y-3">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={3}
                  placeholder="답변을 입력하세요..."
                  className="w-full resize-none rounded-xl bg-input-background border border-border p-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 text-[12px]">
                    <input
                      type="radio"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                    />
                    Private 답변
                  </label>
                  <label className="flex items-center gap-2 text-[12px]">
                    <input
                      type="radio"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                    />
                    FAQ 게시
                  </label>
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply}
                    className="ml-auto flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-[13px] disabled:opacity-50"
                  >
                    <Reply className="w-4 h-4" /> {sendingReply ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

