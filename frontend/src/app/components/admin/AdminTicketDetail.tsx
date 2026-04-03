import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import { StatusBadge } from "../shared/StatusBadge";
import { api, type Question, type QuestionMessage } from "../../lib/api";
import { getAdminSession, getSelectedSpaceId } from "../../lib/admin-session";
import {
  isRealtimeEnabled,
  subscribeToQuestionMessages,
} from "../../lib/supabase-realtime";

function mapToBadgeStatus(status: Question["Status"]) {
  if (status === "pending") return "new";
  if (status === "answered") return "answered";
  return "closed";
}

export function AdminTicketDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const questionId = Number(params.id || 0);
  const admin = getAdminSession();
  const spaceId = getSelectedSpaceId();

  const [question, setQuestion] = useState<Question | null>(null);
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [reply, setReply] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [sendingReply, setSendingReply] = useState(false);

  async function load(silent = false) {
    if (!questionId) return;
    try {
      const [questionData, messageData] = await Promise.all([
        api.getQuestionById(questionId),
        api.getQuestionMessages(questionId),
      ]);
      setQuestion(questionData);
      setMessages(messageData);
    } catch (error) {
      if (!silent) {
        const message = error instanceof Error ? error.message : "티켓 조회 실패";
        toast.error(message);
      }
    }
  }

  useEffect(() => {
    load();
  }, [questionId]);

  useEffect(() => {
    if (isRealtimeEnabled) return;
    if (!questionId) return;
    const id = window.setInterval(() => {
      load(true);
    }, 2500);
    return () => window.clearInterval(id);
  }, [questionId]);

  useEffect(() => {
    if (!questionId || !isRealtimeEnabled) return;
    return subscribeToQuestionMessages(questionId, () => {
      load(true);
    });
  }, [questionId]);

  const submitReply = async () => {
    if (!question || !admin || !spaceId) return;
    if (!reply.trim()) return;
    const sendingText = reply.trim();
    const optimisticMessage: QuestionMessage = {
      QuestionMessageID: -Date.now(),
      QuestionID: question.QuestionID,
      SenderType: "admin",
      AdminID: admin.AdminID,
      ParticipantID: question.ParticipantID,
      MessageText: sendingText,
      IsInternalNote: false,
      CreatedAt: new Date().toISOString(),
    };
    try {
      setSendingReply(true);
      setReply("");
      setMessages((prev) => [...prev, optimisticMessage]);
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              Status: "answered",
              AssignedAdminID: admin.AdminID,
              UpdatedAt: new Date().toISOString(),
            }
          : prev,
      );

      let patchBody: Partial<Question> = { Status: "answered", AssignedAdminID: admin.AdminID };
      if (visibility === "public") {
        await api.createQuestionMessage({
          QuestionID: question.QuestionID,
          SenderType: "admin",
          AdminID: admin.AdminID,
          ParticipantID: question.ParticipantID,
          MessageText: sendingText,
        });
        const post = await api.createFeedPost({
          SpaceID: spaceId,
          AuthorAdminID: admin.AdminID,
          PostType: "faq",
          Title: question.Title || `Q${question.QuestionID} FAQ`,
          BodyText: sendingText,
          IsPublished: true,
          PublishedAt: new Date().toISOString(),
        });
        patchBody = { ...patchBody, PublishedFaqPostID: post.FeedPostID };
        await api.updateQuestion(question.QuestionID, patchBody);
      } else {
        await Promise.all([
          api.createQuestionMessage({
            QuestionID: question.QuestionID,
            SenderType: "admin",
            AdminID: admin.AdminID,
            ParticipantID: question.ParticipantID,
            MessageText: sendingText,
          }),
          api.updateQuestion(question.QuestionID, patchBody),
        ]);
      }
      load(true);
      toast.success("답변을 보냈습니다.");
    } catch (error) {
      setMessages((prev) =>
        prev.filter((message) => message.QuestionMessageID !== optimisticMessage.QuestionMessageID),
      );
      setReply(sendingText);
      load(true);
      const message = error instanceof Error ? error.message : "답변 전송 실패";
      toast.error(message);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <Toaster position="top-center" richColors />
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-1.5 text-[14px] text-muted-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {!question ? (
        <p className="text-[13px] text-muted-foreground">불러오는 중...</p>
      ) : (
        <>
          <div className="mb-3">
            <StatusBadge status={mapToBadgeStatus(question.Status)} />
            <h2 className="text-[18px] text-foreground mt-2">
              {question.Title || "Untitled question"}
            </h2>
            <p className="text-[14px] text-foreground/80 mt-2 whitespace-pre-wrap">
              {question.BodyText}
            </p>
          </div>

          <div className="space-y-2 mb-4">
            {messages.map((message) => (
              <div
                key={message.QuestionMessageID}
                className={`rounded-xl p-3 text-[13px] ${
                  message.SenderType === "admin" ? "bg-accent" : "bg-muted"
                }`}
              >
                <p className="text-[11px] text-muted-foreground mb-1">{message.SenderType}</p>
                <p className="whitespace-pre-wrap">{message.MessageText}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={4}
              placeholder="Type your reply..."
              className="w-full resize-none rounded-xl bg-input-background border border-border p-3 text-[14px]"
            />
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-[12px]">
                <input
                  type="radio"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                />
                Private
              </label>
              <label className="flex items-center gap-2 text-[12px]">
                <input
                  type="radio"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                />
                Publish FAQ
              </label>
              <button
                onClick={submitReply}
                disabled={sendingReply}
                className="ml-auto px-5 py-2.5 bg-primary text-white rounded-xl text-[14px] disabled:opacity-50"
              >
                {sendingReply ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

