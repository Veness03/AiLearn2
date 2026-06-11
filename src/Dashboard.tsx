import { motion } from "motion/react";
import { useStore } from "./store";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Target, Trophy, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function Dashboard() {
  const history = useStore((state) => state.learningHistory);
  const achievements = useStore((state) => state.achievements);

  const completedTopics = history.filter(t => t.completed);
  const avgScore = completedTopics.length > 0 
    ? Math.round(completedTopics.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / completedTopics.length * 100) 
    : 0;

  const chartData = [...completedTopics].reverse().map(t => ({
    name: t.title.substring(0, 10) + '...',
    score: Math.round((t.score / t.maxScore) * 100)
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8 mt-12 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Your Dashboard</h1>
        <p className="text-slate-400">Track your learning progress and achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Topics Explored", value: history.length, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
          { title: "Quizzes Completed", value: completedTopics.length, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { title: "Average Accuracy", value: `${avgScore}%`, icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
          { title: "Achievements", value: achievements.filter(a => a.unlockedAt).length, icon: Trophy, color: "text-orange-400", bg: "bg-orange-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between p-0 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">{stat.title}</CardTitle>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-4xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Performance Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {chartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#f8fafc" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Complete more quizzes to see your trend.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Recent Explorations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.slice(0, 5).map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div>
                      <h4 className="font-bold text-white mb-1">{topic.title}</h4>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                          {topic.difficulty}
                        </span>
                        <p className="text-[11px] text-slate-400 flex items-center">
                          {new Date(topic.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {topic.completed ? (
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{topic.score}/{topic.maxScore}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">Score</div>
                      </div>
                    ) : (
                      <Link to={`/learn/${topic.id}`}>
                        <button className="text-sm px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5">
                          Resume
                        </button>
                      </Link>
                    )}
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No topics explored yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-0 backdrop-blur-lg flex flex-col h-full">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-start gap-4 p-4 rounded-2xl border ${
                      achievement.unlockedAt 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/5 border-white/5 opacity-50 grayscale"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${achievement.unlockedAt ? "bg-violet-500/20 text-violet-400" : "bg-slate-800 text-slate-500"}`}>
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{achievement.title}</h4>
                      <p className="text-xs text-slate-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <div className="p-4 rounded-2xl bg-violet-600 flex items-center justify-between shadow-lg shadow-violet-600/20 group cursor-pointer transition-transform hover:scale-[1.02]">
                  <div className="text-white font-bold text-sm">Review All</div>
                  <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
