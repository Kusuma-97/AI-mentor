import { useMentor } from "@/lib/mentor-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Target, BookOpen, CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useStreaks } from "@/hooks/use-streaks";
import StreakBadges from "@/components/dashboard/StreakBadges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProgressTab() {
  const { quizResults, roadmap, topicsExplored, interest, level, resetDomainsProgress, chatsByDomain } = useMentor();
  const [resetting, setResetting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [failedDomains, setFailedDomains] = useState<{ domain: string; error: string }[]>([]);

  // Discover all domains the user has touched
  const availableDomains = useMemo(() => {
    const set = new Set<string>();
    quizResults.forEach((r) => r.interest && set.add(r.interest));
    Object.keys(chatsByDomain ?? {}).forEach((k) => k && set.add(k));
    if (interest) set.add(interest);
    return Array.from(set).sort();
  }, [quizResults, chatsByDomain, interest]);

  const toggleDomain = (d: string) =>
    setSelected((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const handleReset = async (targetDomains?: string[]) => {
    const targets = targetDomains ?? selected;
    if (targets.length === 0) return;
    setResetting(true);
    try {
      const { succeeded, failed } = await resetDomainsProgress(targets);

      if (succeeded.length > 0 && failed.length === 0) {
        toast.success(
          succeeded.length === 1
            ? `Progress reset for ${succeeded[0]}`
            : `Progress reset for ${succeeded.length} domains`
        );
        setSelected([]);
        setFailedDomains([]);
        setDialogOpen(false);
      } else if (succeeded.length > 0 && failed.length > 0) {
        toast.warning(
          `Reset ${succeeded.length} of ${succeeded.length + failed.length} domains. ${failed.length} failed.`
        );
        // Keep only failed ones selected so the user can retry
        setSelected(failed.map((f) => f.domain));
        setFailedDomains(failed);
      } else {
        toast.error(`Failed to reset progress for ${failed.length} domain${failed.length === 1 ? "" : "s"}`);
        setSelected(failed.map((f) => f.domain));
        setFailedDomains(failed);
      }
    } catch {
      toast.error("Failed to reset progress");
    } finally {
      setResetting(false);
    }
  };
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
          className="flex flex-wrap items-center justify-between gap-2 text-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
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
          </div>
          {availableDomains.length > 0 && (
            <AlertDialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) {
                  setSelected(interest ? [interest] : []);
                  setFailedDomains([]);
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5" disabled={resetting}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart Progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restart progress for selected domains?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select one or more domains. Milestone completion, milestone progress, and quiz
                    results will be reset for each. Roadmap milestones and chat history are kept.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {failedDomains.length > 0 && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    <p className="font-medium text-destructive mb-1">
                      Failed to reset {failedDomains.length} domain{failedDomains.length === 1 ? "" : "s"}
                    </p>
                    <ul className="space-y-0.5 text-xs text-destructive/90 list-disc list-inside">
                      {failedDomains.map((f) => (
                        <li key={f.domain}>
                          <span className="font-medium">{f.domain}</span>
                          <span className="text-destructive/70"> — {f.error}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Successful domains were reset. Retry just the failed ones below.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleReset(failedDomains.map((f) => f.domain))}
                        disabled={resetting}
                      >
                        {resetting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Retry failed
                      </Button>
                    </div>
                  </div>
                )}

                <div className="my-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {selected.length} of {availableDomains.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-primary hover:underline disabled:opacity-50 disabled:pointer-events-none"
                      onClick={() => setSelected(availableDomains)}
                      disabled={resetting}
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:underline disabled:opacity-50 disabled:pointer-events-none"
                      onClick={() => setSelected([])}
                      disabled={resetting}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 rounded-md border border-border/50 p-2">
                  {availableDomains.map((d) => (
                    <label
                      key={d}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded ${resetting ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50 cursor-pointer"}`}
                    >
                      <Checkbox
                        checked={selected.includes(d)}
                        onCheckedChange={() => toggleDomain(d)}
                        disabled={resetting}
                      />
                      <span className="text-sm">{d}</span>
                    </label>
                  ))}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleReset();
                    }}
                    disabled={selected.length === 0 || resetting}
                  >
                    {resetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Restarting…
                      </>
                    ) : (
                      <>Restart {selected.length > 0 ? `(${selected.length})` : ""}</>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
