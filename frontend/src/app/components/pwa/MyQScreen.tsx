import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TopAppBar } from "./TopAppBar";
import { BottomTabBar } from "./BottomTabBar";
import { StatusBadge } from "../shared/StatusBadge";
import { EmptyState } from "../shared/EmptyState";
import { ArrowLeft, ExternalLink, MessageCircleQuestion } from "lucide-react";
import { api, type Question, type QuestionMessage } from "../../lib/api";
import { getParticipantSession } from "../../lib/participant-session";
import {
  isRealtimeEnabled,
  subscribeToParticipantQuestions,
  subscribeToQuestionMessages,
} from "../../lib/supabase-realtime";

type QuestionThread = {
  question: Question;
  messages: QuestionMessage[];
};

function mapStatus(status: Question["Status"]) {
  if (status === "pending") return "new";
  if (status === "answered") return "answered";
  return "closed";
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

export function MyQScreen() {
  const navigate = useNavigate();
  const participantSession = getParticipantSession();
  const [threads, setThreads] = useState<QuestionThread[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(
    async (silent = false) => {
      if (!participantSession?.ParticipantID) {
        if (!silent) setLoading(false);
        return;
      }

      try {
        const questions = await api.getQuestions({
          participantId: participantSession.ParticipantID,
        });

        const messageGroups = await Promise.all(
          questions.map((question) => api.getQuestionMessages(question.QuestionID)),
        );

        setThreads(
          questions.map((question, index) => ({
            question,
            messages: messageGroups[index],
          })),
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [participantSession?.ParticipantID],
  );

  useEffect(() => {
    loadThreads();

    if (!participantSession?.ParticipantID) return;
    const id = window.setInterval(() => {
      loadThreads(true);
    }, 2500);

    return () => window.clearInterval(id);
  }, [participantSession?.ParticipantID, loadThreads]);

  useEffect(() => {
    if (!participantSession?.ParticipantID || !isRealtimeEnabled) return;
    return subscribeToParticipantQuestions(participantSession.ParticipantID, () => {
      loadThreads(true);
    });
  }, [participantSession?.ParticipantID, loadThreads]);

  useEffect(() => {
    if (!selectedQuestionId || !isRealtimeEnabled) return;
    return subscribeToQuestionMessages(selectedQuestionId, () => {
      loadThreads(true);
    });
  }, [selectedQuestionId, loadThreads]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.question.QuestionID === selectedQuestionId) || null,
    [selectedQuestionId, threads],
  );

  if (!participantSession?.ParticipantID) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <TopAppBar title="My Q" />
        <EmptyState
          icon={MessageCircleQuestion}
          title="아직 참여하지 않았어요"
          description="익명 참여 후 질문을 보내면 여기서 답변 스레드를 볼 수 있습니다."
          action={{ label: "입장하러 가기", onClick: () => navigate("/") }}
        />
        <BottomTabBar />
      </div>
    );
  }

  if (selectedThread) {
    const latestAdminReply = [...selectedThread.messages]
      .reverse()
      .find((message) => message.SenderType === "admin");

    return (
      <div className="min-h-screen bg-background pb-16 flex flex-col">
        <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-40 border-b border-border">
          <div className="flex items-center gap-2 h-12 px-4 max-w-[500px] mx-auto">
            <button onClick={() => setSelectedQuestionId(null)} className="p-1 -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[15px] truncate">Conversation</h1>
            </div>
            <StatusBadge status={mapStatus(selectedThread.question.Status)} />
          </div>
        </header>

        <div className="flex-1 max-w-[500px] w-full mx-auto px-4 pt-5 pb-4">
          {selectedThread.question.PublishedFaqPostID && (
            <button
              onClick={() => navigate(`/pwa/feed/${selectedThread.question.PublishedFaqPostID}`)}
              className="w-full flex items-center justify-center gap-1.5 mb-5 px-3 py-2.5 bg-accent rounded-xl text-[12px] text-primary"
            >
              <ExternalLink className="w-3 h-3" />
              이 답변은 FAQ로 게시되었습니다
            </button>
          )}

          <div className="flex justify-end mb-4">
            <div className="max-w-[80%]">
              <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                <p className="text-[14px] leading-relaxed">
                  {selectedThread.question.BodyText}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground text-right mt-1 pr-1">
                {toTimeLabel(selectedThread.question.CreatedAt)}
              </p>
            </div>
          </div>

          {selectedThread.messages.length === 0 ? (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-border/50 text-[13px] text-muted-foreground">
                Waiting for reply...
              </div>
            </div>
          ) : (
            selectedThread.messages.map((message) => (
              <div
                key={message.QuestionMessageID}
                className={`flex mb-4 ${
                  message.SenderType === "participant" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[80%]">
                  <div
                    className={`px-4 py-3 shadow-sm text-[14px] leading-relaxed ${
                      message.SenderType === "participant"
                        ? "bg-primary text-white rounded-2xl rounded-br-md"
                        : "bg-white text-foreground rounded-2xl rounded-bl-md border border-border/50"
                    }`}
                  >
                    {message.MessageText}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 px-1">
                    {toTimeLabel(message.CreatedAt)}
                  </p>
                </div>
              </div>
            ))
          )}

          {!latestAdminReply && selectedThread.question.Status === "pending" && (
            <div className="text-[12px] text-muted-foreground mt-2">
              관리자 답변을 기다리는 중입니다.
            </div>
          )}
        </div>

        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopAppBar title="My Q" />

      <div className="max-w-[500px] mx-auto">
        {loading ? (
          <div className="px-4 pt-6 text-[13px] text-muted-foreground">불러오는 중...</div>
        ) : threads.length === 0 ? (
          <EmptyState
            icon={MessageCircleQuestion}
            title="아직 질문이 없어요"
            description="질문을 보내면 여기서 답변 스레드를 확인할 수 있습니다."
            action={{ label: "질문하러 가기", onClick: () => navigate("/pwa/ask") }}
          />
        ) : (
          <div className="flex flex-col">
            {threads.map((thread) => {
              const latestMessage = thread.messages[thread.messages.length - 1];
              const preview = latestMessage?.MessageText || thread.question.BodyText;

              return (
                <button
                  key={thread.question.QuestionID}
                  onClick={() => setSelectedQuestionId(thread.question.QuestionID)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition border-b border-border/50"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                    <span className="text-[14px] text-primary">R</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] text-foreground">Rapicial Crew</span>
                        <StatusBadge status={mapStatus(thread.question.Status)} />
                        {thread.question.PublishedFaqPostID && (
                          <span className="text-[10px] text-primary bg-accent px-1 py-0.5 rounded-lg">
                            FAQ
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {toTimeLabel(thread.question.UpdatedAt)}
                      </span>
                    </div>
                    <p className="text-[13px] truncate pr-2 text-muted-foreground">{preview}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}
