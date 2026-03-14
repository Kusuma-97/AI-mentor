import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMentor, Interest, Level } from "@/lib/mentor-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code, Database, Brain, Palette, Smartphone, Shield, Sparkles, Home, User, LogOut, Sun, Moon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";

const interests: { label: Interest; icon: React.ElementType; desc: string; color: string }[] = [
  { label: "Web Development", icon: Code, desc: "HTML, CSS, JS, React & more", color: "250 76% 58%" },
  { label: "Data Science", icon: Database, desc: "Analytics, pandas, visualization", color: "175 65% 46%" },
  { label: "Machine Learning", icon: Brain, desc: "Neural networks, NLP, CV", color: "290 70% 58%" },
  { label: "UI/UX Design", icon: Palette, desc: "Figma, design systems, UX research", color: "330 75% 58%" },
  { label: "Mobile Development", icon: Smartphone, desc: "React Native, Flutter, iOS/Android", color: "38 92% 50%" },
  { label: "Cybersecurity", icon: Shield, desc: "Security, cryptography, pentesting", color: "160 60% 44%" },
];

const levels: Level[] = ["Beginner", "Intermediate", "Advanced"];

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Onboarding() {
  const { setInterest, setLevel, setPreferences } = useMentor();
  const { signOut } = useAuth();
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const navigate = useNavigate();

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleStart = () => {
    if (!selectedInterest || !selectedLevel) return;
    setInterest(selectedInterest);
    setLevel(selectedLevel);
    navigate("/dashboard");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        <AnimatedBackground />

        {/* Top bar with nav icons */}
        <motion.div
          className="flex justify-end items-center gap-2 px-4 py-3 relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button onClick={toggleTheme} className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ scale: 1.15, rotate: 20 }} whileTap={{ scale: 0.9 }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={dark ? "moon" : "sun"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>{dark ? "Light mode" : "Dark mode"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <Home className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Dashboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <User className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Profile</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button onClick={() => { signOut(); navigate("/auth"); }} className="text-muted-foreground hover:text-destructive transition-colors" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                <LogOut className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </motion.div>

        {/* Hero */}
        <motion.header className="text-center py-16 px-4 relative z-10" variants={fadeUp} initial="initial" animate="animate">
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-9 w-9 text-primary" />
            </motion.div>
            <motion.h1
              className="text-5xl font-extrabold tracking-tight gradient-text"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              AI Mentor
            </motion.h1>
          </div>
          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your personalized AI-powered learning companion. Get guided roadmaps, interactive quizzes, and expert mentorship — all tailored to you.
          </motion.p>
        </motion.header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-16 space-y-10 relative z-10">
          {/* Interest Selection */}
          <motion.section variants={fadeUp} initial="initial" animate="animate">
            <motion.h2
              className="text-2xl font-bold text-foreground mb-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              What do you want to <span className="gradient-text">learn</span>?
            </motion.h2>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
              {interests.map(({ label, icon: Icon, desc, color }) => (
                <motion.div key={label} variants={fadeUp} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
                  <Card
                    onClick={() => setSelectedInterest(label)}
                    className={`cursor-pointer p-5 transition-all duration-300 hover:shadow-lg relative overflow-hidden group ${
                      selectedInterest === label
                        ? "ring-2 ring-primary shadow-lg glow-sm"
                        : "hover:border-primary/40"
                    }`}
                  >
                    {/* Color accent bar */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                      style={{ background: `hsl(${color})` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: selectedInterest === label ? 1 : 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                      style={{ background: `hsl(${color})` }}
                    />
                    <div className="relative z-10">
                      <motion.div
                        animate={selectedInterest === label ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-7 w-7 mb-2" style={{ color: `hsl(${color})` }} />
                      </motion.div>
                      <h3 className="font-semibold text-foreground">{label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Level Picker */}
          <motion.section variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.15 }}>
            <motion.h2
              className="text-2xl font-bold text-foreground mb-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              Your <span className="gradient-text">skill level</span>
            </motion.h2>
            <div className="flex gap-3 flex-wrap">
              {levels.map((l, i) => (
                <motion.div key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={selectedLevel === l ? "default" : "outline"}
                    onClick={() => setSelectedLevel(l)}
                    className={`px-8 py-5 text-base ${selectedLevel === l ? "gradient-primary text-primary-foreground glow-sm" : ""}`}
                  >
                    {l}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto px-12 py-6 text-lg gradient-primary text-primary-foreground glow-md hover:opacity-90 transition-opacity"
                disabled={!selectedInterest || !selectedLevel}
                onClick={handleStart}
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}>
                  <Sparkles className="h-5 w-5 mr-2" />
                </motion.div>
                Start Learning
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
}
