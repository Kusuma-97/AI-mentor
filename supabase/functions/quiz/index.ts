import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { interest, level, milestone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const milestoneTitle = milestone?.title?.toString().slice(0, 200);
    const milestoneDesc = milestone?.description?.toString().slice(0, 500);

    const systemContent = milestoneTitle
      ? `You are a quiz generator for ${interest} at ${level} level. Generate questions strictly focused on the roadmap module: "${milestoneTitle}". Stay tightly on this module's scope.`
      : `You are a quiz generator for ${interest} at ${level} level. Generate challenging but fair multiple-choice questions.`;

    const userContent = milestoneTitle
      ? `Generate 5 multiple-choice quiz questions for a ${level} learner about the module "${milestoneTitle}"${milestoneDesc ? ` — ${milestoneDesc}` : ""}. Set the topic field to this module name. All questions must be specific to this module's content, not general ${interest}.`
      : `Generate 5 multiple-choice quiz questions about ${interest} for a ${level} learner. Pick a specific subtopic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate quiz questions with answers",
              parameters: {
                type: "object",
                properties: {
                  topic: { type: "string", description: "The specific subtopic of the quiz" },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correct: { type: "number", description: "Zero-based index of correct option" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correct", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["topic", "questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No quiz generated");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
