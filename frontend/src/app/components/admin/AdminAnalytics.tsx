import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Clock, FileText, Users, TrendingUp, BarChart3 } from "lucide-react";
import { api, type FeedPost, type Participant, type Question } from "../../lib/api";
import { useSelectedSpaceId } from "../../lib/admin-session";

function diffMinutes(a: string, b: string) {
  return Math.max(0, (new Date(a).getTime() - new Date(b).getTime()) / 60000);
}

export function AdminAnalytics() {
  const selectedSpaceId = useSelectedSpaceId();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!selectedSpaceId) return;
      setLoading(true);
      try {
        const [questionData, postData, participantData] = await Promise.all([
          api.getQuestions({ spaceId: selectedSpaceId }),
          api.getFeedPosts({ spaceId: selectedSpaceId }),
          api.getParticipants({ spaceId: selectedSpaceId }),
        ]);
        setQuestions(questionData);
        setPosts(postData);
        setParticipants(participantData);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selectedSpaceId]);

  const metrics = useMemo(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter((question) => question.Status === "answered").length;
    const closedQuestions = questions.filter((question) => question.Status === "closed").length;
    const resolved = answeredQuestions + closedQuestions;
    const resolutionRate = totalQuestions ? Math.round((resolved / totalQuestions) * 100) : 0;
    const faqCount = posts.filter((post) => post.PostType === "faq").length;
    const activeUsers = participants.filter((participant) => participant.Status === "active").length;
    const avgResponseCandidates = questions
      .filter((question) => question.Status === "answered" || question.Status === "closed")
      .map((question) => diffMinutes(question.UpdatedAt, question.CreatedAt));
    const avgResponseTime = avgResponseCandidates.length
      ? Math.round(
          avgResponseCandidates.reduce((sum, value) => sum + value, 0) / avgResponseCandidates.length,
        )
      : 0;

    return { totalQuestions, faqCount, activeUsers, resolutionRate, avgResponseTime };
  }, [participants, posts, questions]);

  const categoryBreakdown = useMemo(() => {
    const buckets = new Map<string, number>();
    questions.forEach((question) => {
      const bucket = question.Title?.startsWith("[")
        ? question.Title.split("]")[0]?.replace("[", "") || "Other"
        : "Other";
      buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    });
    return Array.from(buckets.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [questions]);

  const hourlyData = useMemo(() => {
    const map = new Map<number, number>();
    for (let i = 0; i < 24; i += 1) map.set(i, 0);
    questions.forEach((question) => {
      const hour = new Date(question.CreatedAt).getHours();
      map.set(hour, (map.get(hour) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([hour, count]) => ({ hour: `${String(hour).padStart(2, "0")}h`, count }))
      .filter((entry) => entry.count > 0)
      .slice(-8);
  }, [questions]);

  const maxHourly = Math.max(1, ...hourlyData.map((entry) => entry.count));
  const totalCategorized = Math.max(1, categoryBreakdown.reduce((sum, item) => sum + item.count, 0));

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto lg:mx-0">
      <h2 className="text-[20px] text-foreground mb-1">Analytics</h2>
      <p className="text-[12px] text-muted-foreground mb-5">
        {selectedSpaceId ? `Space #${selectedSpaceId}` : "Space를 선택해 주세요"}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total Questions",
            value: metrics.totalQuestions,
            icon: MessageSquare,
          },
          {
            label: "Avg Response",
            value: `${metrics.avgResponseTime} min`,
            icon: Clock,
          },
          {
            label: "Published FAQs",
            value: metrics.faqCount,
            icon: FileText,
          },
          {
            label: "Active Users",
            value: metrics.activeUsers,
            icon: Users,
          },
          {
            label: "Resolution Rate",
            value: `${metrics.resolutionRate}%`,
            icon: TrendingUp,
          },
          {
            label: "Posts",
            value: posts.length,
            icon: BarChart3,
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[24px] text-foreground tabular-nums">{card.value}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="text-[16px] text-foreground mb-4">Questions by Hour</h3>
          {loading ? (
            <p className="text-[12px] text-muted-foreground">불러오는 중...</p>
          ) : hourlyData.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">데이터가 없습니다.</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {hourlyData.map((entry) => (
                <div key={entry.hour} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground tabular-nums">{entry.count}</span>
                  <div
                    className="w-full bg-primary/80 rounded-t-lg"
                    style={{ height: `${(entry.count / maxHourly) * 100}%`, minHeight: 4 }}
                  />
                  <span className="text-[10px] text-muted-foreground">{entry.hour}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="text-[16px] text-foreground mb-4">Questions by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">카테고리 데이터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                  <span className="text-[14px] text-foreground flex-1">{item.category}</span>
                  <div className="w-24">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary rounded-full h-1.5"
                        style={{ width: `${(item.count / totalCategorized) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[12px] text-muted-foreground tabular-nums w-8 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
