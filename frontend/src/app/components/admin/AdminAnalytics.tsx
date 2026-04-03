import { MessageSquare, Clock, FileText, Search, ArrowDownRight, Users, TrendingUp, BarChart3 } from "lucide-react";

const stats = [
  { label: "Total Questions", value: "47", icon: MessageSquare, change: "+12 today", positive: true },
  { label: "Avg Response Time", value: "4.2 min", icon: Clock, change: "-1.3 min", positive: true },
  { label: "Published FAQs", value: "12", icon: FileText, change: "+3 today", positive: true },
  { label: "Deflection Rate", value: "34%", icon: ArrowDownRight, change: "+8%", positive: true },
  { label: "Active Users", value: "183", icon: Users, change: "+29 last hour", positive: true },
  { label: "Resolution Rate", value: "78%", icon: TrendingUp, change: "+5%", positive: true },
];

const topSearches = [
  { keyword: "wifi password", count: 23 },
  { keyword: "parking", count: 18 },
  { keyword: "lunch", count: 15 },
  { keyword: "keynote", count: 12 },
  { keyword: "charging station", count: 9 },
  { keyword: "lost and found", count: 7 },
];

const categoryBreakdown = [
  { category: "Schedule", count: 14, color: "bg-violet-500" },
  { category: "Location", count: 11, color: "bg-blue-500" },
  { category: "Lost & Found", count: 8, color: "bg-rose-500" },
  { category: "Booth", count: 6, color: "bg-orange-500" },
  { category: "General", count: 5, color: "bg-gray-500" },
  { category: "Other", count: 3, color: "bg-emerald-500" },
];

const hourlyData = [
  { hour: "10AM", questions: 3 },
  { hour: "11AM", questions: 7 },
  { hour: "12PM", questions: 12 },
  { hour: "1PM", questions: 8 },
  { hour: "2PM", questions: 5 },
  { hour: "3PM", questions: 9 },
  { hour: "4PM", questions: 3 },
];

const totalQuestions = categoryBreakdown.reduce((a, b) => a + b.count, 0);
const maxHourly = Math.max(...hourlyData.map((d) => d.questions));

export function AdminAnalytics() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto lg:mx-0">
      <h2 className="text-[20px] text-foreground mb-1">Analytics</h2>
      <p className="text-[12px] text-muted-foreground mb-5">Rapicial Demo Festival 2026 · Live</p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-primary" />
              <span className={`text-[11px] px-1.5 py-0.5 rounded-lg ${
                stat.positive ? "text-primary bg-accent" : "text-amber-700 bg-amber-50"
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[24px] text-foreground tabular-nums">{stat.value}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hourly question volume */}
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[16px] text-foreground">Questions by Hour</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {hourlyData.map((d) => (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground tabular-nums">{d.questions}</span>
                <div
                  className="w-full bg-primary/80 rounded-t-lg transition-all"
                  style={{ height: `${(d.questions / maxHourly) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="text-[16px] text-foreground mb-4">Questions by Category</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                <span className="text-[14px] text-foreground flex-1">{item.category}</span>
                <div className="w-24">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`${item.color} rounded-full h-1.5`}
                      style={{ width: `${(item.count / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[12px] text-muted-foreground tabular-nums w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top searches */}
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[16px] text-foreground">Top Searched Keywords</h3>
          </div>
          <div className="space-y-2.5">
            {topSearches.map((item, i) => (
              <div key={item.keyword} className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground w-5 text-right tabular-nums">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] text-foreground">{item.keyword}</span>
                    <span className="text-[12px] text-muted-foreground tabular-nums">{item.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ width: `${(item.count / topSearches[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity timeline */}
        <div className="bg-white rounded-2xl border border-border/50 p-5">
          <h3 className="text-[16px] text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { time: "Just now", event: "New question: \"Last shuttle time?\"", type: "question" },
              { time: "2 min ago", event: "FAQ published: \"Wi-Fi Password\"", type: "publish" },
              { time: "5 min ago", event: "Ticket closed: \"Is the event free?\"", type: "close" },
              { time: "8 min ago", event: "Reply sent to Anonymous #2210", type: "reply" },
              { time: "12 min ago", event: "Poll created: \"Stage preference\"", type: "poll" },
              { time: "15 min ago", event: "User banned: Anonymous #7733", type: "moderation" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  item.type === "question" ? "bg-primary" :
                  item.type === "publish" ? "bg-blue-500" :
                  item.type === "close" ? "bg-gray-400" :
                  item.type === "reply" ? "bg-violet-500" :
                  item.type === "poll" ? "bg-orange-500" :
                  "bg-red-400"
                }`} />
                <div className="flex-1">
                  <p className="text-[13px] text-foreground">{item.event}</p>
                  <p className="text-[11px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
