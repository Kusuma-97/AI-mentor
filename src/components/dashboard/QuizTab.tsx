import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMentor } from "@/lib/mentor-context";
import { invokeFunction } from "@/lib/ai-stream";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HelpCircle, CheckCircle, XCircle, Trophy, Timer, Flame, History } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useStreaks } from "@/hooks/use-streaks";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface MilestoneCtx {
  index: number;
  title: string;
  description: string;
}

const QUESTION_SECONDS = 30;

export default function QuizTab() {
  const { interest, level, addQuizResult, quizResults, pendingQuizMilestone, clearPendingQuizMilestone } = useMentor();
  const { recordQuizCompletion } = useStreaks();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [activeMilestone, setActiveMilestone] = useState<MilestoneCtx | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const lastHandled = useRef<string | null>(null);

  // Recent attempts scoped to current interest/level
  const recentAttempts = useMemo(
    () =>
      quizResults
        .filter((r) => (!interest || r.interest === interest) && (!r.level || !level || r.level === level))
        .slice(-5)
        .reverse(),
    [quizResults, interest, level]
  );

  const generate = useCallback(async (milestone?: MilestoneCtx | null) => {
    setLoading(true);
    try {
      const data = await invokeFunction<{ questions: Question[]; topic: string }>("quiz", {
        interest,
        level,
        milestone: milestone ? { title: milestone.title, description: milestone.description } : undefined,
      });
      setQuestions(data.questions);
      setTopic(data.topic);
      setCurrent(0);
      setSelected(null);
      setScore(0);
      setCombo(0);
      setBestCombo(0);
      setSecondsLeft(QUESTION_SECONDS);
      setFinished(false);
      setActiveMilestone(milestone ?? null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }, [interest, level]);

  // Auto-launch when a roadmap milestone requests a quiz
  useEffect(() => {
    if (!pendingQuizMilestone) return;
    const key = `${pendingQuizMilestone.index}::${pendingQuizMilestone.title}`;
    if (lastHandled.current === key) return;
    lastHandled.current = key;
    generate(pendingQuizMilestone);
    clearPendingQuizMilestone();
  }, [pendingQuizMilestone, generate, clearPendingQuizMilestone]);

  const handleAnswer = useCallback((idx: number) => {
    setSelected((prev) => {
      if (prev !== null) return prev;
      const correct = idx === questions[current]?.correct;
      if (correct) {
        setScore((s) => s + 1);
        setCombo((c) => {
          const nc = c + 1;
          setBestCombo((b) => Math.max(b, nc));
          return nc;
        });
      } else {
        setCombo(0);
      }
      return idx;
    });
  }, [current, questions]);

  // Per-question countdown
  useEffect(() => {
    if (questions.length === 0 || finished || selected !== null) return;
    setSecondsLeft(QUESTION_SECONDS);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          // Auto-lock with no selection
          setSelected(-1);
          setCombo(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [current, questions.length, finished, selected]);

  const next = useCallback(() => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
      addQuizResult({ topic, score, total: questions.length, timestamp: Date.now() });
      recordQuizCompletion().then((newBadges) => {
        if (newBadges && newBadges.length > 0) {
          toast.success("🏆 New badge earned!", { description: `You unlocked ${newBadges.length} badge(s)!` });
        }
      });
    }
  }, [current, questions.length, addQuizResult, topic, score, recordQuizCompletion]);

  // Keyboard shortcuts: 1-9 to answer, Enter to advance
  useEffect(() => {
    if (questions.length === 0 || finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const q = questions[current];
      if (!q) return;
      if (selected === null) {
        const n = parseInt(e.key, 10);
        if (!isNaN(n) && n >= 1 && n <= q.options.length) {
          handleAnswer(n - 1);
        }
      } else if (e.key === "Enter") {
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questions, current, selected, finished, handleAnswer, next]);

  if (questions.length === 0 || finished) {
    const pct = finished && questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <motion.div className="text-center py-16 max-w-2xl mx-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        {finished ? (
          <>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              <Trophy className="h-14 w-14 text-warning mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Quiz Complete!</h2>
            <p className="text-lg text-muted-foreground mb-1">Topic: <span className="text-primary">{topic}</span></p>
            <motion.p
              className="text-4xl font-extrabold gradient-text mb-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {score}/{questions.length} <span className="text-2xl text-muted-foreground">({pct}%)</span>
            </motion.p>
            {bestCombo > 1 && (
              <p className="text-sm text-warning mb-4 inline-flex items-center gap-1">
                <Flame className="h-4 w-4" /> Best streak: {bestCombo} in a row
              </p>
            )}
          </>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <HelpCircle className="h-14 w-14 text-primary mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Test Your Knowledge</h2>
            <p className="text-muted-foreground mb-6">
              {activeMilestone ? (
                <>Quiz for module: <span className="text-primary font-medium">{activeMilestone.title}</span></>
              ) : (
                <>AI-generated quiz on <span className="text-primary font-medium">{interest}</span> for <span className="text-primary font-medium">{level}</span> level.</>
              )}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              💡 Tip: press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">4</kbd> to answer, <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">Enter</kbd> to continue.
            </p>
          </>
        )}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex gap-2 justify-center flex-wrap">
          <Button onClick={() => generate(activeMilestone)} disabled={loading} className="gradient-primary text-primary-foreground px-8">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {finished ? (activeMilestone ? "Retake Module Quiz" : "New Quiz") : "Start Quiz"}
          </Button>
          {activeMilestone && (
            <Button variant="outline" onClick={() => { setActiveMilestone(null); generate(null); }} disabled={loading}>
              General Quiz
            </Button>
          )}
        </motion.div>

        {/* Quiz history */}
        {recentAttempts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-left"
          >
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4 text-primary" />
                Recent attempts
                <span className="text-xs text-muted-foreground">({recentAttempts.length})</span>
              </span>
              <span className="text-xs text-muted-foreground">{showHistory ? "Hide" : "Show"}</span>
            </button>
            <AnimatePresence initial={false}>
              {showHistory && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-1.5 overflow-hidden"
                >
                  {recentAttempts.map((r, i) => {
                    const p = Math.round((r.score / r.total) * 100);
                    const tone = p >= 80 ? "text-success" : p >= 50 ? "text-warning" : "text-destructive";
                    return (
                      <li
                        key={`${r.timestamp}-${i}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-border/40 bg-background/40 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{r.topic}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-semibold ${tone}`}>{p}%</p>
                          <p className="text-xs text-muted-foreground">{r.score}/{r.total}</p>
                        </div>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    );
  }

  const q = questions[current];
  const progressPct = ((current + 1) / questions.length) * 100;
  const timePct = (secondsLeft / QUESTION_SECONDS) * 100;
  const timerTone = secondsLeft <= 5 ? "text-destructive" : secondsLeft <= 10 ? "text-warning" : "text-primary";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.div
        className="flex items-center justify-between text-sm text-muted-foreground p-3 rounded-lg bg-card/60 border border-border/50"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <span>Question {current + 1}/{questions.length}</span>
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full gradient-primary rounded-full" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <motion.span
              key={combo}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 text-warning font-semibold"
              title="Answer streak"
            >
              <Flame className="h-3.5 w-3.5" />×{combo}
            </motion.span>
          )}
          <span className={`inline-flex items-center gap-1 font-medium ${timerTone}`}>
            <Timer className="h-3.5 w-3.5" />{secondsLeft}s
          </span>
          <motion.span
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-primary font-semibold"
          >
            Score: {score}
          </motion.span>
        </div>
      </motion.div>
      {/* Timer bar */}
      <div className="h-1 -mt-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${secondsLeft <= 5 ? "bg-destructive" : secondsLeft <= 10 ? "bg-warning" : "gradient-primary"}`}
          animate={{
            width: `${timePct}%`,
            opacity: secondsLeft <= 5 && selected === null ? [1, 0.4, 1] : 1,
          }}
          transition={{
            width: { duration: 0.4, ease: "linear" },
            opacity: { duration: 0.6, repeat: secondsLeft <= 5 && selected === null ? Infinity : 0 },
          }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={
              selected !== null && selected !== q.correct && selected !== -1
                ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Confetti burst on correct */}
            <AnimatePresence>
              {selected !== null && selected === q.correct && (
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-center overflow-visible z-10">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const dist = 90 + Math.random() * 70;
                    const colors = ["bg-primary", "bg-accent", "bg-warning", "bg-success"];
                    return (
                      <motion.span
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos(angle) * dist,
                          y: Math.sin(angle) * dist * 0.6 + 30,
                          opacity: 0,
                          scale: 0.3,
                          rotate: Math.random() * 540,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`absolute top-4 h-2 w-2 rounded-sm ${colors[i % colors.length]}`}
                      />
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            <Card className={`border-border/50 hover:shadow-md transition-all ${
              selected !== null && selected === q.correct ? "ring-2 ring-success/50 shadow-lg shadow-success/10" : ""
            } ${selected !== null && selected !== q.correct && selected !== -1 ? "ring-2 ring-destructive/40" : ""}`}>
              <CardHeader>
                <CardTitle className="text-lg">{q.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt, i) => {
                  let variant: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link" = "outline";
                  let icon = null;
                  if (selected !== null) {
                    if (i === q.correct) { variant = "default"; icon = <CheckCircle className="h-4 w-4" />; }
                    else if (i === selected) { icon = <XCircle className="h-4 w-4" />; }
                  }
                  const isChosen = selected !== null && i === selected;
                  const isCorrect = selected !== null && i === q.correct;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={
                        isCorrect
                          ? { opacity: 1, y: 0, scale: [1, 1.04, 1] }
                          : isChosen && !isCorrect
                            ? { opacity: 1, y: 0, scale: [1, 0.97, 1] }
                            : { opacity: 1, y: 0, scale: 1 }
                      }
                      transition={{ delay: selected === null ? i * 0.06 : 0, duration: 0.35 }}
                      whileHover={selected === null ? { scale: 1.01, x: 4 } : {}}
                      whileTap={selected === null ? { scale: 0.98 } : {}}
                    >
                      <Button
                        variant={variant}
                        className={`w-full justify-start text-left gap-2 transition-all ${
                          isCorrect ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/30" : ""
                        } ${isChosen && !isCorrect ? "border-destructive text-destructive" : ""} ${
                          selected !== null && !isChosen && !isCorrect ? "opacity-50" : ""
                        }`}
                        onClick={() => handleAnswer(i)}
                        disabled={selected !== null}
                      >
                        <span className={`inline-flex items-center justify-center h-5 w-5 rounded text-xs font-semibold shrink-0 transition-colors ${
                          isCorrect ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                        {icon}
                        <span className="flex-1">{opt}</span>
                      </Button>
                    </motion.div>
                  );
                })}
                <AnimatePresence>
                  {selected !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`mt-4 p-3 rounded-lg border text-sm ${
                          selected === q.correct
                            ? "bg-success/10 border-success/30 text-foreground"
                            : selected === -1
                              ? "bg-warning/10 border-warning/30 text-foreground"
                              : "bg-destructive/10 border-destructive/30 text-foreground"
                        }`}
                      >
                        <strong className={
                          selected === q.correct ? "text-success" : selected === -1 ? "text-warning" : "text-destructive"
                        }>
                          {selected === q.correct ? "Correct!" : selected === -1 ? "Time's up!" : "Not quite."}
                        </strong>{" "}
                        {q.explanation}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Button className="w-full mt-2 gradient-primary text-primary-foreground" onClick={next}>
                          {current < questions.length - 1 ? "Next Question →" : "Finish Quiz 🏁"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

