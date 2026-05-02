import { useMentor } from "@/lib/mentor-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Target, BookOpen, CheckCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useStreaks } from "@/hooks/use-streaks";
import StreakBadges from "@/components/dashboard/StreakBadges";

export default function ProgressTab() {
  const { quizResults, roadmap, topicsExplored, interest, level } = useMentor();
  const { currentStreak, longestStreak, earnedBadges } = useStreaks();

  // Scope quizzes to current domain + difficulty (legacy rows without level fall back to interest match)
  const scopedQuizzes = quizResults.filter((r) => {
    const interestMatch = !interest || !r.interest || r.interest === interest;
    const levelMatch = !r.level || !level || r.level === level;
    return interestMatch && levelMatch;
  });

  const totalQuizzes = scopedQuizzes.length;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(scopedQuizzes.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / totalQuizzes)
    : 0;
  const roadmapProgress = roadmap.length > 0
    ? Math.round(roadmap.reduce((sum, m) => sum + (m.progress ?? (m.completed ? 100 : 0)), 0) / roadmap.length)
    : 0;

  const chartData = scopedQuizzes.map((r, i) => ({
    name: `Q${i + 1}`,
    score: Math.round((r.score / r.total) * 100),
  }));

  const chartConfig = {
    score: { label: "Score %", color: "hsl(var(--primary))" },
  };

  const metrics = [
    { icon: Target, label: "Quizzes Taken", value: totalQuizzes, color: "text-primary" },
    { icon: BarChart3, label: "Avg Accuracy", value: `${avgAccuracy}%`, color: "text-accent" },
    { icon: BookOpen, label: "Topics Explored", value: topicsExplored.length, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Scope indicator */}
      {(interest || level) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <span className="text-muted-foreground">Showing progress for</span>
          {interest && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              {interest}
            </span>
          )}
          {level && (
            <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium border border-accent/20">
              {level}
            </span>
          )}
        </motion.div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="border-border/50 hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />{label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.p
                  className="text-3xl font-extrabold gradient-text"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
                >
                  {value}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <Card className="border-border/50 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                className="text-3xl font-extrabold gradient-text"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.32, type: "spring" }}
              >
                {roadmapProgress}%
              </motion.p>
              <div className="h-2 mt-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${roadmapProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        {chartData.length > 0 ? (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base gradient-text">Quiz Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-8 text-center border-border/50">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-primary opacity-50" />
            </motion.div>
            <p className="text-muted-foreground">Take a quiz to see your performance chart here.</p>
          </Card>
        )}
      </motion.div>

      {/* Streaks & Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
        <StreakBadges currentStreak={currentStreak} longestStreak={longestStreak} earnedBadges={earnedBadges} />
      </motion.div>
    </div>
  );
}
