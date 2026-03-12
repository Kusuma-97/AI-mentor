import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Loader2, Sun, Moon, User, Phone, MapPin, Github, Linkedin, Twitter, BookOpen, Target, Clock, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface ProfileData {
  display_name: string;
  bio: string;
  academic_level: string;
  avatar_url: string;
  phone: string;
  city: string;
  country: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  preferred_subjects: string[];
  learning_goals: string;
  study_hours_per_week: number | null;
}

const academicLevels = [
  "Elementary School", "Middle School", "High School",
  "Undergraduate", "Graduate", "Postgraduate", "Professional",
];

const subjectOptions = [
  "Web Development", "Data Science", "Machine Learning",
  "UI/UX Design", "Mobile Development", "Cybersecurity",
  "Cloud Computing", "DevOps", "Blockchain", "Game Development",
];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [subjectInput, setSubjectInput] = useState("");

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const [profile, setProfile] = useState<ProfileData>({
    display_name: "", bio: "", academic_level: "", avatar_url: "",
    phone: "", city: "", country: "", github_url: "", linkedin_url: "",
    twitter_url: "", preferred_subjects: [], learning_goals: "",
    study_hours_per_week: null,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          display_name: data.display_name ?? "",
          bio: data.bio ?? "",
          academic_level: data.academic_level ?? "",
          avatar_url: data.avatar_url ?? "",
          phone: (data as any).phone ?? "",
          city: (data as any).city ?? "",
          country: (data as any).country ?? "",
          github_url: (data as any).github_url ?? "",
          linkedin_url: (data as any).linkedin_url ?? "",
          twitter_url: (data as any).twitter_url ?? "",
          preferred_subjects: (data as any).preferred_subjects ?? [],
          learning_goals: (data as any).learning_goals ?? "",
          study_hours_per_week: (data as any).study_hours_per_week ?? null,
        });
      }
      if (error) console.error(error);
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name || null,
        bio: profile.bio || null,
        academic_level: profile.academic_level || null,
        avatar_url: profile.avatar_url || null,
        phone: profile.phone || null,
        city: profile.city || null,
        country: profile.country || null,
        github_url: profile.github_url || null,
        linkedin_url: profile.linkedin_url || null,
        twitter_url: profile.twitter_url || null,
        preferred_subjects: profile.preferred_subjects.length > 0 ? profile.preferred_subjects : null,
        learning_goals: profile.learning_goals || null,
        study_hours_per_week: profile.study_hours_per_week,
      } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your profile has been updated." });
    }
  };

  const addSubject = (subject: string) => {
    if (subject && !profile.preferred_subjects.includes(subject)) {
      setProfile(p => ({ ...p, preferred_subjects: [...p.preferred_subjects, subject] }));
    }
    setSubjectInput("");
  };

  const removeSubject = (subject: string) => {
    setProfile(p => ({ ...p, preferred_subjects: p.preferred_subjects.filter(s => s !== subject) }));
  };

  const initials = profile.display_name
    ? profile.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const update = (key: keyof ProfileData, value: any) => setProfile(p => ({ ...p, [key]: value }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-64 gradient-primary opacity-5 blur-2xl pointer-events-none" />

        <motion.header
          className="border-b bg-card/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-primary transition-colors"
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <h1 className="text-xl font-bold gradient-text">My Profile</h1>
          <div className="ml-auto">
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
          </div>
        </motion.header>

        <main className="max-w-2xl mx-auto px-4 py-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="overflow-hidden glass border-border/50 glow-sm">
              {/* Avatar section */}
              <div className="gradient-primary p-8 flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl font-bold bg-background text-primary">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-primary-foreground/80">{user?.email}</p>
              </div>

              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input id="display_name" value={profile.display_name} onChange={e => update("display_name", e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={profile.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 234 567 8900" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={profile.bio} onChange={e => update("bio", e.target.value)} placeholder="Tell us about yourself..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input id="avatar_url" value={profile.avatar_url} onChange={e => update("avatar_url", e.target.value)} placeholder="https://example.com/avatar.png" />
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={profile.city} onChange={e => update("city", e.target.value)} placeholder="San Francisco" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={profile.country} onChange={e => update("country", e.target.value)} placeholder="United States" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Github className="h-4 w-4" /> Social Links</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="github_url" className="flex items-center gap-1.5"><Github className="h-3.5 w-3.5" /> GitHub</Label>
                      <Input id="github_url" value={profile.github_url} onChange={e => update("github_url", e.target.value)} placeholder="https://github.com/username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url" className="flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</Label>
                      <Input id="linkedin_url" value={profile.linkedin_url} onChange={e => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter_url" className="flex items-center gap-1.5"><Twitter className="h-3.5 w-3.5" /> Twitter / X</Label>
                      <Input id="twitter_url" value={profile.twitter_url} onChange={e => update("twitter_url", e.target.value)} placeholder="https://x.com/username" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Learning */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4" /> Learning Preferences</h3>
                  <div className="space-y-2">
                    <Label htmlFor="academic_level">Academic Level</Label>
                    <Select value={profile.academic_level} onValueChange={v => update("academic_level", v)}>
                      <SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger>
                      <SelectContent>
                        {academicLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Preferred Subjects</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.preferred_subjects.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {s}
                          <button onClick={() => removeSubject(s)} className="hover:text-destructive ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                    <Select value={subjectInput} onValueChange={v => addSubject(v)}>
                      <SelectTrigger><SelectValue placeholder="Add a subject..." /></SelectTrigger>
                      <SelectContent>
                        {subjectOptions.filter(s => !profile.preferred_subjects.includes(s)).map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learning_goals" className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Learning Goals</Label>
                    <Textarea id="learning_goals" value={profile.learning_goals} onChange={e => update("learning_goals", e.target.value)} placeholder="What do you want to achieve?" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="study_hours" className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Study Hours / Week</Label>
                    <Input
                      id="study_hours"
                      type="number"
                      min={0}
                      max={168}
                      value={profile.study_hours_per_week ?? ""}
                      onChange={e => update("study_hours_per_week", e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>

                <Separator />

                <Button onClick={handleSave} disabled={saving} className="w-full gap-2 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
}
