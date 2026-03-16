import { useState } from "react";
import { useMentor } from "@/lib/mentor-context";
import { invokeFunction } from "@/lib/ai-stream";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HelpCircle, CheckCircle, XCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useStreaks } from "@/hooks/use-streaks";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function QuizTab() {
  const { interest, level, addQuizResult } = useMentor();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");

  const generate = async () => {
    setLoading(true);
    try {
      const data = await invokeFunction<{ questions: Question[]; topic: string }>("quiz", { interest, level });
      setQuestions(data.questions);
      setTopic(data.topic);
      setCurrent(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      const finalScore = selected === questions[current].correct ? score + 0 : score;
      setFinished(true);
      addQuizResult({ topic, score: finalScore || score, total: questions.length, timestamp: Date.now() });
    }
  };

  if (questions.length === 0 || finished) {
    return (
      <motion.div className="text-center py-20" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
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
              className="text-4xl font-extrabold gradient-text mb-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {score}/{questions.length}
            </motion.p>
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
            <p className="text-muted-foreground mb-6">AI-generated quiz on <span className="text-primary font-medium">{interest}</span> for <span className="text-primary font-medium">{level}</span> level.</p>
          </>
        )}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={generate} disabled={loading} className="gradient-primary text-primary-foreground px-8">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {finished ? "New Quiz" : "Start Quiz"}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const q = questions[current];
  const progressPct = ((current + 1) / questions.length) * 100;

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
        <span className="text-primary font-semibold">Score: {score}</span>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/50 hover:shadow-md transition-shadow">
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
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={selected === null ? { scale: 1.01, x: 4 } : {}}
                  >
                    <Button
                      variant={variant}
                      className={`w-full justify-start text-left gap-2 ${
                        selected !== null && i === q.correct ? "gradient-primary text-primary-foreground" : ""
                      } ${selected !== null && i === selected && i !== q.correct ? "border-destructive text-destructive" : ""}`}
                      onClick={() => handleAnswer(i)}
                      disabled={selected !== null}
                    >
                      {icon}
                      {opt}
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
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
                      <strong className="text-primary">Explanation:</strong> {q.explanation}
                    </div>
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button className="w-full mt-2 gradient-primary text-primary-foreground" onClick={next}>
                        {current < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
