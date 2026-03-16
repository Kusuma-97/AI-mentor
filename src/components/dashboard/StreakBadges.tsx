import { BADGE_DEFINITIONS } from "@/hooks/use-streaks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  currentStreak: number;
  longestStreak: number;
  earnedBadges: string[];
}

export default function StreakBadges({ currentStreak, longestStreak, earnedBadges }: Props) {
  return (
    <div className="space-y-4">
      {/* Streak cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
          <Card className="border-border/50 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                className="text-3xl font-extrabold gradient-text"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                {currentStreak} <span className="text-base font-normal text-muted-foreground">days</span>
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} whileHover={{ y: -4 }}>
          <Card className="border-border/50 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />Best Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.p
                className="text-3xl font-extrabold gradient-text"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.05 }}
              >
                {longestStreak} <span className="text-base font-normal text-muted-foreground">days</span>
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badges */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base gradient-text">Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {BADGE_DEFINITIONS.map((badge, i) => {
              const earned = earnedBadges.includes(badge.key);
              return (
                <Tooltip key={badge.key}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.15 }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[80px] ${
                        earned
                          ? "bg-primary/10 border-primary/30 shadow-sm"
                          : "bg-muted/30 border-border/30 opacity-40 grayscale"
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className={`text-[10px] font-semibold text-center leading-tight ${earned ? "text-primary" : "text-muted-foreground"}`}>
                        {badge.label}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{badge.label}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
