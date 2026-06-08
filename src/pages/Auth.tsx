import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sun, Moon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import logo from "/logo.png";

export default function Auth() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgot) {
        await resetPassword(email);
        toast.success("Check your email for a reset link.");
        setIsForgot(false);
      } else if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate("/onboarding");
      } else {
        if (!displayName.trim()) {
          toast.error("Please enter your name");
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName);
        toast.success("Account created! You're now signed in.");
        navigate("/onboarding");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const modeTitle = isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account";
  const modeDescription = isForgot
    ? "Enter your email and we'll send you a reset link"
    : isLogin
      ? "Sign in to continue your learning journey"
      : "Join AI Mentor and start learning today";

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <AnimatedBackground />
        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          className="absolute top-4 right-4 z-20 text-muted-foreground hover:text-primary transition-colors"
          whileHover={{ scale: 1.15, rotate: 20 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={dark ? "moon" : "sun"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <img src={logo} alt="AI Mentor" className="h-10 w-10" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">AI Mentor</h1>
          </motion.div>

          <Card className="glass glow-sm border-border/50">
            <CardHeader className="text-center">
              <motion.div
                key={isForgot ? "forgot" : isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardTitle className="text-xl">{modeTitle}</CardTitle>
                <CardDescription>{modeDescription}</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isForgot && !isLogin && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required={!isLogin}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div className="space-y-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </motion.div>
                <AnimatePresence>
                  {!isForgot && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required={!isForgot} minLength={6} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-4 flex flex-col gap-2 text-center text-sm text-muted-foreground">
                {isForgot ? (
                  <button type="button" onClick={() => setIsForgot(false)} className="inline-flex items-center justify-center gap-1 text-primary font-medium hover:underline">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                  </button>
                ) : (
                  <>
                    {isLogin && (
                      <button type="button" onClick={() => setIsForgot(true)} className="text-primary font-medium hover:underline">
                        Forgot password?
                      </button>
                    )}
                    <div>
                      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                      <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                        {isLogin ? "Sign up" : "Sign in"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
