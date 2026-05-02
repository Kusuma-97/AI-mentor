import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type Interest = "Web Development" | "Data Science" | "Machine Learning" | "UI/UX Design" | "Mobile Development" | "Cybersecurity";
export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface QuizResult {
  topic: string;
  score: number;
  total: number;
  timestamp: number;
  interest?: string | null;
  level?: string | null;
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
  progress: number; // 0–100
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MentorContextType {
  interest: Interest | null;
  level: Level | null;
  setInterest: (i: Interest) => void;
  setLevel: (l: Level) => void;
  setPreferences: (i: Interest, l: Level) => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  persistChatMessage: (msg: ChatMessage) => void;
  chatsByDomain: Record<string, ChatMessage[]>;
  quizResults: QuizResult[];
  addQuizResult: (r: QuizResult) => void;
  roadmap: RoadmapMilestone[];
  setRoadmap: (r: RoadmapMilestone[]) => void;
  toggleMilestone: (index: number) => void;
  setMilestoneProgress: (index: number, progress: number) => void;
  topicsExplored: string[];
  addTopic: (t: string) => void;
  pendingQuizMilestone: { index: number; title: string; description: string } | null;
  requestMilestoneQuiz: (m: { index: number; title: string; description: string }) => void;
  clearPendingQuizMilestone: () => void;
  resetDomainProgress: (domain: string) => Promise<void>;
  dataLoading: boolean;
}

const MentorContext = createContext<MentorContextType | null>(null);

export function MentorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [interest, setInterestState] = useState<Interest | null>(null);
  const [level, setLevelState] = useState<Level | null>(null);
  const [chatsByDomain, setChatsByDomain] = useState<Record<string, ChatMessage[]>>({});
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [roadmapsByDomain, setRoadmapsByDomain] = useState<Record<string, RoadmapMilestone[]>>({});
  const [topicsExplored, setTopicsExplored] = useState<string[]>([]);
  const [pendingQuizMilestone, setPendingQuizMilestone] = useState<{ index: number; title: string; description: string } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const requestMilestoneQuiz = useCallback((m: { index: number; title: string; description: string }) => {
    setPendingQuizMilestone(m);
  }, []);
  const clearPendingQuizMilestone = useCallback(() => setPendingQuizMilestone(null), []);

  const domainKey = interest ?? "";
  const roadmap = roadmapsByDomain[domainKey] ?? [];
  const chatMessages = chatsByDomain[domainKey] ?? [];

  // Load all user data from DB on login
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    const loadData = async () => {
      setDataLoading(true);
      try {
        // Load preferences
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (prefs) {
          setInterestState(prefs.interest as Interest);
          setLevelState(prefs.level as Level);
        }

        // Load quiz results
        const { data: quizzes } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (quizzes) {
          setQuizResults(quizzes.map((q: any) => ({
            topic: q.topic,
            score: q.score,
            total: q.total,
            timestamp: new Date(q.created_at).getTime(),
            interest: q.interest ?? null,
            level: q.level ?? null,
          })));
        }

        // Load roadmap milestones grouped by interest
        const [{ data: milestones }, { data: progressRows }] = await Promise.all([
          supabase
            .from("roadmap_milestones")
            .select("*")
            .eq("user_id", user.id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("milestone_progress")
            .select("interest, sort_order, progress")
            .eq("user_id", user.id),
        ]);

        if (milestones) {
          const progressMap = new Map<string, number>();
          (progressRows ?? []).forEach((p: any) => {
            progressMap.set(`${p.interest}::${p.sort_order}`, p.progress);
          });

          const grouped: Record<string, RoadmapMilestone[]> = {};
          milestones.forEach((m: any) => {
            if (!grouped[m.interest]) grouped[m.interest] = [];
            const idx = grouped[m.interest].length;
            const stored = progressMap.get(`${m.interest}::${idx}`);
            const completed = m.completed ?? false;
            grouped[m.interest].push({
              title: m.title,
              description: m.description,
              resources: m.resources ?? [],
              completed,
              progress: stored ?? (completed ? 100 : 0),
            });
          });
          setRoadmapsByDomain(grouped);
        }

        // Load chat messages grouped by interest
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (msgs) {
          const grouped: Record<string, ChatMessage[]> = {};
          msgs.forEach(m => {
            if (!grouped[m.interest]) grouped[m.interest] = [];
            grouped[m.interest].push({ role: m.role as "user" | "assistant", content: m.content });
          });
          setChatsByDomain(grouped);
        }

        // Load topics explored
        const { data: topics } = await supabase
          .from("topics_explored")
          .select("*")
          .eq("user_id", user.id);

        if (topics) {
          setTopicsExplored(topics.map(t => t.topic));
        }
      } catch (err) {
        console.error("Failed to load mentor data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Save preferences to DB
  const setInterest = useCallback((i: Interest) => {
    setInterestState(i);
    if (user) {
      supabase.from("user_preferences").upsert(
        { user_id: user.id, interest: i, level: level ?? "Beginner" },
        { onConflict: "user_id" }
      ).then();
    }
  }, [user, level]);

  const setLevel = useCallback((l: Level) => {
    setLevelState(l);
    if (user) {
      supabase.from("user_preferences").upsert(
        { user_id: user.id, interest: interest ?? "", level: l },
        { onConflict: "user_id" }
      ).then();
    }
  }, [user, interest]);

  const setPreferences = useCallback((i: Interest, l: Level) => {
    setInterestState(i);
    setLevelState(l);
    if (user) {
      supabase.from("user_preferences").upsert(
        { user_id: user.id, interest: i, level: l },
        { onConflict: "user_id" }
      ).then();
    }
  }, [user]);

  // Pure in-memory updates only — persistence happens via persistChatMessage
  const setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = useCallback(
    (action) => {
      setChatsByDomain((prev) => {
        const current = prev[domainKey] ?? [];
        const next = typeof action === "function" ? action(current) : action;
        return { ...prev, [domainKey]: next };
      });
    },
    [domainKey]
  );

  const persistChatMessage = useCallback((msg: ChatMessage) => {
    if (!user || !domainKey) return;
    supabase.from("chat_messages").insert({
      user_id: user.id,
      interest: domainKey,
      role: msg.role,
      content: msg.content,
    }).then(({ error }) => {
      if (error) console.error("Failed to persist chat message:", error);
    });
  }, [user, domainKey]);

  const addQuizResult = useCallback((r: QuizResult) => {
    const enriched: QuizResult = { ...r, interest: r.interest ?? interest, level: r.level ?? level };
    setQuizResults((prev) => [...prev, enriched]);
    if (user) {
      supabase.from("quiz_results").insert({
        user_id: user.id,
        topic: enriched.topic,
        score: enriched.score,
        total: enriched.total,
        interest: enriched.interest,
        level: enriched.level,
      } as any).then();
    }
  }, [user, interest, level]);

  const setRoadmap = useCallback((r: RoadmapMilestone[]) => {
    const normalized = r.map((m) => ({ ...m, progress: m.progress ?? (m.completed ? 100 : 0) }));
    setRoadmapsByDomain((prev) => ({ ...prev, [domainKey]: normalized }));
    if (user && domainKey) {
      // Replace milestones for this interest
      supabase.from("roadmap_milestones")
        .delete()
        .eq("user_id", user.id)
        .eq("interest", domainKey)
        .then(() => {
          const rows = normalized.map((m, i) => ({
            user_id: user.id,
            interest: domainKey,
            title: m.title,
            description: m.description,
            resources: m.resources,
            completed: m.completed,
            sort_order: i,
          }));
          if (rows.length > 0) {
            supabase.from("roadmap_milestones").insert(rows).then();
          }
        });

      // Reset per-milestone progress for this interest
      supabase.from("milestone_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("interest", domainKey)
        .then(() => {
          const progressRows = normalized.map((m, i) => ({
            user_id: user.id,
            interest: domainKey,
            sort_order: i,
            progress: m.progress,
          }));
          if (progressRows.length > 0) {
            supabase.from("milestone_progress").insert(progressRows).then();
          }
        });
    }
  }, [domainKey, user]);

  const toggleMilestone = useCallback((index: number) => {
    setRoadmapsByDomain((prev) => {
      const current = prev[domainKey] ?? [];
      const updated = current.map((m, i) => {
        if (i !== index) return m;
        const completed = !m.completed;
        return { ...m, completed, progress: completed ? 100 : 0 };
      });

      if (user && domainKey) {
        const target = updated[index];
        supabase.from("roadmap_milestones")
          .update({ completed: target.completed })
          .eq("user_id", user.id)
          .eq("interest", domainKey)
          .eq("sort_order", index)
          .then();

        supabase.from("milestone_progress")
          .upsert({
            user_id: user.id,
            interest: domainKey,
            sort_order: index,
            progress: target.progress,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,interest,sort_order" })
          .then();
      }

      return { ...prev, [domainKey]: updated };
    });
  }, [domainKey, user]);

  const setMilestoneProgress = useCallback((index: number, progress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    setRoadmapsByDomain((prev) => {
      const current = prev[domainKey] ?? [];
      const updated = current.map((m, i) => {
        if (i !== index) return m;
        return { ...m, progress: clamped, completed: clamped >= 100 };
      });

      if (user && domainKey) {
        const target = updated[index];
        supabase.from("milestone_progress")
          .upsert({
            user_id: user.id,
            interest: domainKey,
            sort_order: index,
            progress: clamped,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,interest,sort_order" })
          .then();

        supabase.from("roadmap_milestones")
          .update({ completed: target.completed })
          .eq("user_id", user.id)
          .eq("interest", domainKey)
          .eq("sort_order", index)
          .then();
      }

      return { ...prev, [domainKey]: updated };
    });
  }, [domainKey, user]);

  const addTopic = useCallback((t: string) => {
    setTopicsExplored((prev) => {
      if (prev.includes(t)) return prev;
      if (user) {
        supabase.from("topics_explored").insert({
          user_id: user.id,
          topic: t,
        }).then();
      }
      return [...prev, t];
    });
  }, [user]);

  const resetDomainProgress = useCallback(async (domain: string) => {
    if (!user || !domain) return;
    // Reset milestone progress + completion + quiz results for this domain
    await Promise.all([
      supabase.from("milestone_progress").delete().eq("user_id", user.id).eq("interest", domain),
      supabase.from("roadmap_milestones").update({ completed: false }).eq("user_id", user.id).eq("interest", domain),
      supabase.from("quiz_results").delete().eq("user_id", user.id).eq("interest", domain),
    ]);
    setRoadmapsByDomain((prev) => {
      const current = prev[domain];
      if (!current) return prev;
      return { ...prev, [domain]: current.map((m) => ({ ...m, completed: false, progress: 0 })) };
    });
    setQuizResults((prev) => prev.filter((r) => r.interest !== domain));
  }, [user]);

  return (
    <MentorContext.Provider
      value={{
        interest, level, setInterest, setLevel, setPreferences,
        chatMessages, setChatMessages, persistChatMessage, chatsByDomain,
        quizResults, addQuizResult,
        roadmap, setRoadmap, toggleMilestone, setMilestoneProgress,
        topicsExplored, addTopic,
        pendingQuizMilestone, requestMilestoneQuiz, clearPendingQuizMilestone,
        resetDomainProgress,
        dataLoading,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
}

export function useMentor() {
  const ctx = useContext(MentorContext);
  if (!ctx) throw new Error("useMentor must be used within MentorProvider");
  return ctx;
}
