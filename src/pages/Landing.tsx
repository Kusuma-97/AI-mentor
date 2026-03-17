import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, BarChart3, MessageCircle, Zap, ArrowRight, CheckCircle2, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import logo from "/logo.png";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Mentoring",
    description: "Get personalized guidance from an intelligent mentor that adapts to your learning style and pace.",
  },
  {
    icon: Target,
    title: "Custom Roadmaps",
    description: "Receive tailored learning paths with milestones designed around your goals and interests.",
  },
  {
    icon: MessageCircle,
    title: "Interactive Chat",
    description: "Ask questions, explore concepts, and dive deep into topics with real-time AI conversations.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Visualize your growth with detailed analytics, quiz scores, and achievement tracking.",
  },
  {
    icon: Zap,
    title: "Adaptive Quizzes",
    description: "Test your knowledge with dynamically generated quizzes that challenge you at the right level.",
  },
  {
    icon: CheckCircle2,
    title: "Milestone System",
    description: "Break down complex topics into manageable milestones and celebrate every win.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={logo} alt="AI Mentor logo" className="h-8 w-8" />
          <span className="text-xl font-bold gradient-text">AI Mentor</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" onClick={() => navigate("/about")} className="text-muted-foreground hover:text-primary">
            About
          </Button>
          <Button variant="ghost" onClick={() => navigate("/leaderboard")} className="gap-1.5 text-muted-foreground hover:text-primary">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/auth")} className="border-primary/30 hover:border-primary/60">
            Sign In
          </Button>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-28 md:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary glow-md"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Your Personal{" "}
            <span className="gradient-text">AI Learning</span>{" "}
            Companion
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
            Master any subject with an intelligent mentor that builds custom roadmaps, generates quizzes, and tracks your progress — all powered by AI.
          </p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity px-8 text-base gap-2"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="border-border/60 text-base"
            >
              See How It Works
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 pb-24 md:px-12">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything You Need to <span className="gradient-text">Learn Smarter</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful tools designed to accelerate your learning journey.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Card className="glass border-border/40 hover:glow-sm transition-shadow duration-300 h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gradient-primary">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-20 md:px-12">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass glow-md border-primary/20 overflow-hidden">
            <CardContent className="p-10 md:p-14">
              <h2 className="text-2xl font-bold sm:text-3xl mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join AI Mentor today and transform the way you learn. It's free to get started.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity px-10 text-base gap-2"
              >
                Create Your Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AI Mentor. Built with intelligence.
      </footer>
    </div>
  );
}
