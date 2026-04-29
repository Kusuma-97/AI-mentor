import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, ArrowLeft, AlertTriangle, Lightbulb, CheckCircle2,
  Brain, Map, ClipboardCheck, BarChart3, Clock, Globe, Zap,
  Trophy, Target, DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import PageTransition from "@/components/PageTransition";
import logo from "/logo.png";

const benefits = [
  { icon: Target, title: "Personalized Learning", desc: "Content adapts to your chosen interest and skill level — no generic courses." },
  { icon: Brain, title: "24/7 AI Mentorship", desc: "Instant, expert-level guidance available anytime without waiting for a human mentor." },
  { icon: Map, title: "Structured Learning Paths", desc: "AI-curated roadmaps with real resource links eliminate the 'what to learn next' confusion." },
  { icon: Trophy, title: "Gamified Motivation", desc: "Streaks, badges, and leaderboards turn learning into a rewarding daily habit." },
  { icon: BarChart3, title: "Data-Driven Progress", desc: "Visual analytics help you understand your growth and identify weak areas." },
  { icon: DollarSign, title: "Cost-Effective", desc: "Provides mentorship-quality guidance without expensive tutoring or course fees." },
  { icon: Globe, title: "Accessible & Inclusive", desc: "Web-based, responsive design works on any device — desktop or mobile." },
  { icon: Zap, title: "Zero Setup", desc: "Select your interests and start learning immediately — no complex onboarding." },
  { icon: ClipboardCheck, title: "Adaptive Difficulty", desc: "Quizzes and roadmaps adjust based on beginner, intermediate, or advanced levels." },
  { icon: Clock, title: "Community Competition", desc: "Leaderboard fosters healthy competition and peer motivation among learners." },
];

const solutionPillars = [
  { icon: Brain, title: "Conversational AI Mentorship", desc: "Real-time chat powered by advanced AI that understands your context, adapts its tone, and provides expert guidance. Adjust creativity, depth, and even use voice input." },
  { icon: Map, title: "Dynamic Roadmap Generation", desc: "Custom learning paths with 6–8 tailored milestones, each linked to trusted resources like MDN, freeCodeCamp, Coursera, and official docs." },
  { icon: ClipboardCheck, title: "Adaptive Quiz Engine", desc: "AI-generated quizzes with instant feedback and explanations. A streak and badge system rewards consistency across 3, 7, 14, 30, and 60-day milestones." },
  { icon: BarChart3, title: "Progress Analytics Dashboard", desc: "Visual charts tracking quiz performance, topics explored, and roadmap completion. AI insights highlight strengths and areas for improvement." },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
};

export default function About() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <AnimatedBackground />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <img src={logo} alt="AI Mentor" className="h-6 w-6" />
            <span className="font-bold gradient-text">AI Mentor</span>
          </button>
          <Button variant="outline" onClick={() => navigate("/auth")} className="border-primary/30 hover:border-primary/60">
            Get Started
          </Button>
        </nav>

        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 space-y-20">

          {/* Hero */}
          <motion.section className="pt-12 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              About <span className="gradient-text">AI Mentor</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Understanding the challenge we solve, our approach, and why it matters.
            </p>
          </motion.section>

          {/* Problem Statement */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">The Problem</h2>
            </div>
            <Card className="glass border-border/40">
              <CardContent className="p-6 md:p-8 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Self-directed learning in technology is plagued by <strong className="text-foreground">information overload</strong> and a lack of structured guidance. Learners face thousands of tutorials, courses, and resources with no clear path forward — leading to confusion, frustration, and high dropout rates.
                </p>
                <p>
                  Traditional learning platforms offer <strong className="text-foreground">generic, one-size-fits-all curricula</strong> that fail to adapt to individual skill levels, interests, or learning pace. Without real-time feedback and personalized mentorship, learners struggle to identify knowledge gaps and measure meaningful progress.
                </p>
                <p>
                  Access to quality mentorship remains <strong className="text-foreground">expensive and scarce</strong> — limited by geography, cost, and mentor availability — leaving millions of aspiring learners without the guidance they need to succeed.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          <Separator className="opacity-40" />

          {/* Proposed Solution */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Lightbulb className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">Proposed Solution</h2>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-3xl">
              <strong className="text-foreground">AI Mentor</strong> is an intelligent, web-based learning companion that delivers personalized, AI-driven mentorship across multiple tech domains — combining four core pillars into one seamless experience:
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {solutionPillars.map((p, i) => (
                <motion.div key={p.title} custom={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
                  <Card className="glass border-border/40 h-full hover:glow-sm transition-shadow">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                        <p.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <Separator className="opacity-40" />

          {/* Benefits */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">Key Benefits</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((b, i) => (
                <motion.div key={b.title} custom={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="flex items-start gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <b.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Card className="glass glow-md border-primary/20">
              <CardContent className="p-10">
                <h2 className="text-2xl font-bold mb-3">Ready to Experience It?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start your personalized learning journey today — it's free.</p>
                <Button size="lg" onClick={() => navigate("/auth")} className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity px-8 gap-2">
                  Get Started Free
                  <Sparkles className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        </div>

        <footer className="relative z-10 border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Mentor. Built with intelligence.
        </footer>
      </div>
    </PageTransition>
  );
}
