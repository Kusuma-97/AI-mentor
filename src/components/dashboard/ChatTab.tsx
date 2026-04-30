import { useState, useRef, useEffect, useCallback, memo } from "react";
import "@/types/speech.d.ts";
import { useMentor } from "@/lib/mentor-context";
import { streamChat } from "@/lib/ai-stream";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Send, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type ChatMsg = { role: "user" | "assistant"; content: string };

// Memoized message bubble — only re-renders when content/role changes.
const MessageBubble = memo(function MessageBubble({ msg }: { msg: ChatMsg }) {
  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <Card
        className={`max-w-[80%] px-4 py-3 ${
          msg.role === "user"
            ? "gradient-primary text-primary-foreground"
            : "bg-card border-border/50"
        }`}
      >
        {msg.role === "assistant" ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        )}
      </Card>
    </div>
  );
});

export default function ChatTab() {
  const { interest, level, chatMessages, setChatMessages, persistChatMessage, addTopic } = useMentor();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [listening, setListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMsg[]>(chatMessages);
  messagesRef.current = chatMessages;

  // Auto-scroll on new messages, but use 'auto' during streaming for smoothness
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: isLoading ? "auto" : "smooth" });
  }, [chatMessages, isLoading]);

  // Cleanup on unmount: abort stream + stop recognition
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMsg = { role: "user", content: text };
    setInput("");
    setIsLoading(true);

    // Append user message + persist once
    setChatMessages((prev) => [...prev, userMsg]);
    persistChatMessage(userMsg);
    addTopic(text.slice(0, 50));

    // Build conversation snapshot from latest ref (avoids stale closure)
    const history = [...messagesRef.current, userMsg];

    let assistantContent = "";
    let assistantPushed = false;

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setChatMessages((prev) => {
        if (!assistantPushed) {
          assistantPushed = true;
          return [...prev, { role: "assistant", content: assistantContent }];
        }
        // Mutate last assistant message in place (single array shallow-copy)
        const next = prev.slice();
        next[next.length - 1] = { role: "assistant", content: assistantContent };
        return next;
      });
    };

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    try {
      await streamChat({
        endpoint: "chat",
        messages: history,
        extra: { interest, level, temperature, max_tokens: maxTokens },
        signal: controller.signal,
        onDelta: updateAssistant,
        onDone: () => {
          setIsLoading(false);
          if (assistantContent.trim()) {
            persistChatMessage({ role: "assistant", content: assistantContent });
          }
        },
      });
    } catch (e: unknown) {
      setIsLoading(false);
      if ((e as any)?.name === "AbortError") return;
      toast.error(e instanceof Error ? e.message : "Chat failed");
    }
  }, [input, isLoading, interest, level, temperature, maxTokens, setChatMessages, persistChatMessage, addTopic]);

  const toggleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (listening) {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      setListening(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      setInput((prev) => prev + e.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Controls */}
      <motion.div
        className="flex gap-6 mb-4 flex-wrap text-sm p-3 rounded-lg bg-card/60 border border-border/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-muted-foreground whitespace-nowrap">Creativity:</span>
          <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={0} max={1} step={0.1} className="flex-1" />
          <span className="text-primary font-medium w-8">{temperature}</span>
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-muted-foreground whitespace-nowrap">Length:</span>
          <Slider value={[maxTokens]} onValueChange={([v]) => setMaxTokens(v)} min={256} max={4096} step={256} className="flex-1" />
          <span className="text-primary font-medium w-12">{maxTokens}</span>
        </div>
      </motion.div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {chatMessages.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
            </motion.div>
            <p className="text-lg">Ask me anything about <span className="font-semibold gradient-text">{interest}</span>!</p>
            <p className="text-sm mt-1 text-muted-foreground">I'll guide you as your personal AI mentor.</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble msg={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && chatMessages[chatMessages.length - 1]?.role !== "assistant" && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="px-4 py-3 bg-card border-border/50">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </Card>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="icon" onClick={toggleVoice} className={listening ? "text-destructive border-destructive/50" : "border-border/50"}>
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </motion.div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your mentor..."
          className="min-h-[44px] max-h-[120px] resize-none border-border/50"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="gradient-primary text-primary-foreground">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
