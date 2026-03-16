import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface Badge {
  key: string;
  label: string;
  icon: string;
  description: string;
  requirement: number; // streak days needed
}

export const BADGE_DEFINITIONS: Badge[] = [
  { key: "streak_3", label: "3-Day Streak", icon: "🔥", description: "Complete quizzes 3 days in a row", requirement: 3 },
  { key: "streak_7", label: "Weekly Warrior", icon: "⚡", description: "7-day quiz streak", requirement: 7 },
  { key: "streak_14", label: "Fortnight Focus", icon: "🌟", description: "14-day quiz streak", requirement: 14 },
  { key: "streak_30", label: "Monthly Master", icon: "👑", description: "30-day quiz streak", requirement: 30 },
  { key: "streak_60", label: "Legendary Learner", icon: "💎", description: "60-day quiz streak", requirement: 60 },
];

export function useStreaks() {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastQuizDate, setLastQuizDate] = useState<string | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      const [{ data: streak }, { data: badges }] = await Promise.all([
        supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_badges").select("badge_key").eq("user_id", user.id),
      ]);

      if (streak) {
        setCurrentStreak(streak.current_streak);
        setLongestStreak(streak.longest_streak);
        setLastQuizDate(streak.last_quiz_date);
      }
      if (badges) {
        setEarnedBadges(badges.map((b: any) => b.badge_key));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const recordQuizCompletion = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    if (lastQuizDate === today) return; // already recorded today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const isConsecutive = lastQuizDate === yesterday;
    const newStreak = isConsecutive ? currentStreak + 1 : 1;
    const newLongest = Math.max(longestStreak, newStreak);

    // Upsert streak
    await supabase.from("user_streaks").upsert({
      user_id: user.id,
      current_streak: newStreak,
      longest_streak: newLongest,
      last_quiz_date: today,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    setCurrentStreak(newStreak);
    setLongestStreak(newLongest);
    setLastQuizDate(today);

    // Check for new badges
    const newBadges: string[] = [];
    for (const badge of BADGE_DEFINITIONS) {
      if (newStreak >= badge.requirement && !earnedBadges.includes(badge.key)) {
        newBadges.push(badge.key);
      }
    }

    if (newBadges.length > 0) {
      const rows = newBadges.map((key) => ({ user_id: user.id, badge_key: key }));
      await supabase.from("user_badges").upsert(rows, { onConflict: "user_id,badge_key" });
      setEarnedBadges((prev) => [...prev, ...newBadges]);
    }

    return newBadges;
  }, [user, lastQuizDate, currentStreak, longestStreak, earnedBadges]);

  return { currentStreak, longestStreak, lastQuizDate, earnedBadges, loading, recordQuizCompletion };
}
