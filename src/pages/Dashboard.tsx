import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMentor } from "@/lib/mentor-context";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Map, HelpCircle, BarChart3, Home, User, LogOut, Sun, Moon, Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ChatTab from "@/components/dashboard/ChatTab";
import RoadmapTab from "@/components/dashboard/RoadmapTab";
import QuizTab from "@/components/dashboard/QuizTab";
import ProgressTab from "@/components/dashboard/ProgressTab";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Dashboard() {
  const { interest, level } = useMentor();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  useEffect(() => {
    if (!interest || !level) navigate("/onboarding");
  }, [interest, level, navigate]);

  if (!interest || !level) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedBackground />

        {/* Header */}
        <motion.header
          className="border-b bg-card/80 backdrop-blur-md px-4 py-3 flex items-center justify-between relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1
            className="text-xl font-bold gradient-text"
            whileHover={{ scale: 1.03 }}
          >
            AI Mentor
          </motion.h1>
          <div className="flex items-center gap-2">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Badge className="gradient-primary text-primary-foreground border-0">{interest}</Badge>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <Badge variant="outline" className="border-primary/30 text-primary">{level}</Badge>
            </motion.div>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button onClick={toggleTheme} className="ml-2 text-muted-foreground hover:text-primary transition-colors" whileHover={{ scale: 1.15, rotate: 20 }} whileTap={{ scale: 0.9 }}>
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
                <motion.button onClick={() => navigate("/onboarding")} className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ scale: 1.15, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Home className="h-4 w-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Home</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-primary transition-colors" whileHover={{ scale: 1.15, rotate: -5 }} whileTap={{ scale: 0.9 }}>
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
          </div>
        </motion.header>

        {/* Main */}
        <main className="max-w-5xl mx-auto px-4 py-6 relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <TabsList className="w-full justify-start mb-6 bg-card/60 backdrop-blur-sm p-2 border border-border/50 gap-1">
                {[
                  { value: "chat", icon: MessageSquare, label: "Chat" },
                  { value: "roadmap", icon: Map, label: "Roadmap" },
                  { value: "quiz", icon: HelpCircle, label: "Quiz" },
                  { value: "progress", icon: BarChart3, label: "Progress" },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="gap-2 relative px-4 py-2.5 font-semibold transition-all duration-300 text-muted-foreground data-[state=active]:text-white data-[state=active]:font-extrabold data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  >
                    <motion.div
                      className="flex items-center gap-2"
                      animate={activeTab === value ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Icon className={`h-4 w-4 transition-all duration-300 ${activeTab === value ? "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : ""}`} />
                      {label}
                    </motion.div>
                    {activeTab === value && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 rounded-md gradient-primary -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    {activeTab === value && (
                      <motion.div
                        layoutId="activeTabGlow"
                        className="absolute -bottom-1 left-1/4 right-1/4 h-0.5 rounded-full bg-primary blur-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <TabsContent value="chat" forceMount={activeTab === "chat" ? true : undefined}>
                  {activeTab === "chat" && <ChatTab />}
                </TabsContent>
                <TabsContent value="roadmap" forceMount={activeTab === "roadmap" ? true : undefined}>
                  {activeTab === "roadmap" && <RoadmapTab />}
                </TabsContent>
                <TabsContent value="quiz" forceMount={activeTab === "quiz" ? true : undefined}>
                  {activeTab === "quiz" && <QuizTab />}
                </TabsContent>
                <TabsContent value="progress" forceMount={activeTab === "progress" ? true : undefined}>
                  {activeTab === "progress" && <ProgressTab />}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
}
