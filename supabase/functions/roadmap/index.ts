import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { interest, level } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert curriculum designer and learning path architect. You must create roadmaps that are HIGHLY SPECIFIC to the exact domain requested — not generic learning advice.

For "${interest}" at "${level}" level:
- Beginner: Start with foundational concepts, terminology, and hands-on introductory exercises specific to ${interest}. Include setup/tooling steps.
- Intermediate: Focus on deeper techniques, real-world projects, common pitfalls, and domain-specific best practices for ${interest}.
- Advanced: Cover cutting-edge topics, optimization, architecture patterns, research papers, and expert-level challenges unique to ${interest}.

Each milestone must include concrete, actionable resources with REAL, WORKING website URLs. Format each resource as "Resource Name | https://actual-url.com". Use well-known, established websites like MDN, freeCodeCamp, Coursera, Udemy, Khan Academy, W3Schools, official documentation sites, GitHub repos, YouTube channels, etc. Never invent fake URLs.`,
          },
          {
            role: "user",
            content: `Create a detailed, domain-specific learning roadmap for mastering "${interest}" at the "${level}" level. Generate 6-8 milestones. Each milestone should have a clear title, a description explaining what the learner will achieve, and 2-3 specific resources with REAL website links. Format each resource as "Resource Name | https://url.com". Use only real, well-known websites.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_roadmap",
              description: "Generate a structured learning roadmap with milestones",
              parameters: {
                type: "object",
                properties: {
                  roadmap: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        resources: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "description", "resources"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["roadmap"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_roadmap" } },
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
    if (!toolCall) throw new Error("No roadmap generated");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
