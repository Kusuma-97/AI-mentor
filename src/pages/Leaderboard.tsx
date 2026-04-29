import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, ArrowLeft, Crown, Target, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import AnimatedBackground from "@/components/AnimatedBackground";
import logo from "/logo.png";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  interest: string;
  level: string;
  total_quizzes: number;
  total_score: number;
  total_possible: number;
  avg_score: number;
  best_score: number;
}

const rankIcons = [
  <Crown className="h-5 w-5 text-warning" />,
  <Medal className="h-5 w-5 text-muted-foreground" />,
  <Award className="h-5 w-5 text-accent" />,
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (!error && data) {
        setEntries(data as LeaderboardEntry[]);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  const userRank = entries.findIndex((e) => e.user_id === user?.id);

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="AI Mentor" className="h-7 w-7" />
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">Leaderboard</h1>
            </div>
          </div>

          {/* User rank highlight */}
          {userRank >= 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="glass glow-sm border-primary/30 mb-6">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      #{userRank + 1}
                    </div>
                    <span className="font-medium">Your Rank</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      {entries[userRank].avg_score}% avg
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {entries[userRank].total_quizzes} quizzes
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Leaderboard list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <Card className="glass border-border/40">
              <CardContent className="p-10 text-center text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No quiz results yet</p>
                <p className="text-sm mt-1">Complete quizzes to appear on the leaderboard!</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {entries.map((entry, i) => {
                const isCurrentUser = entry.user_id === user?.id;
                const initials = entry.display_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.div key={entry.user_id} variants={item}>
                    <Card
                      className={`glass border-border/40 transition-shadow duration-200 ${
                        isCurrentUser ? "border-primary/40 glow-sm" : "hover:border-border/60"
                      } ${i < 3 ? "border-primary/20" : ""}`}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-8 text-center">
                          {i < 3 ? (
                            rankIcons[i]
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {i + 1}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="text-xs gradient-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isCurrentUser ? "text-primary" : ""}`}>
                            {entry.display_name}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-2">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.interest} · {entry.level} · {entry.total_quizzes} quiz{entry.total_quizzes !== 1 ? "zes" : ""}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-bold">{entry.avg_score}%</p>
                          <p className="text-xs text-muted-foreground">avg score</p>
                        </div>

                        {/* Best */}
                        <div className="flex-shrink-0 text-right hidden sm:block">
                          <p className="text-sm font-semibold text-accent">{entry.best_score}%</p>
                          <p className="text-xs text-muted-foreground">best</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
