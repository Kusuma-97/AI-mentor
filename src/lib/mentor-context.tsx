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
  chatsByDomain: Record<string, ChatMessage[]>;
  quizResults: QuizResult[];
  addQuizResult: (r: QuizResult) => void;
  roadmap: RoadmapMilestone[];
  setRoadmap: (r: RoadmapMilestone[]) => void;
  toggleMilestone: (index: number) => void;
  setMilestoneProgress: (index: number, progress: number) => void;
  topicsExplored: string[];
  addTopic: (t: string) => void;
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
  const [dataLoading, setDataLoading] = useState(true);

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
          setQuizResults(quizzes.map(q => ({
            topic: q.topic,
            score: q.score,
            total: q.total,
            timestamp: new Date(q.created_at).getTime(),
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

  const setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = useCallback(
    (action) => {
      setChatsByDomain((prev) => {
        const current = prev[domainKey] ?? [];
        const next = typeof action === "function" ? action(current) : action;

        // Save new messages to DB
        if (user && domainKey && next.length > current.length) {
          const newMsgs = next.slice(current.length);
          newMsgs.forEach(msg => {
            supabase.from("chat_messages").insert({
              user_id: user.id,
              interest: domainKey,
              role: msg.role,
              content: msg.content,
            }).then();
          });
        }

        return { ...prev, [domainKey]: next };
      });
    },
    [domainKey, user]
  );

  const addQuizResult = useCallback((r: QuizResult) => {
    setQuizResults((prev) => [...prev, r]);
    if (user) {
      supabase.from("quiz_results").insert({
        user_id: user.id,
        topic: r.topic,
        score: r.score,
        total: r.total,
        interest: interest,
      }).then();
    }
  }, [user, interest]);

  const setRoadmap = useCallback((r: RoadmapMilestone[]) => {
    setRoadmapsByDomain((prev) => ({ ...prev, [domainKey]: r }));
    if (user && domainKey) {
      // Delete existing milestones for this interest and insert new ones
      supabase.from("roadmap_milestones")
        .delete()
        .eq("user_id", user.id)
        .eq("interest", domainKey)
        .then(() => {
          const rows = r.map((m, i) => ({
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
    }
  }, [domainKey, user]);

  const toggleMilestone = useCallback((index: number) => {
    setRoadmapsByDomain((prev) => {
      const current = prev[domainKey] ?? [];
      const updated = current.map((m, i) => (i === index ? { ...m, completed: !m.completed } : m));

      // Update in DB
      if (user && domainKey) {
        supabase.from("roadmap_milestones")
          .update({ completed: updated[index].completed })
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

  return (
    <MentorContext.Provider
      value={{
        interest, level, setInterest, setLevel, setPreferences,
        chatMessages, setChatMessages, chatsByDomain,
        quizResults, addQuizResult,
        roadmap, setRoadmap, toggleMilestone,
        topicsExplored, addTopic,
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
