import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a strict expense-splitting parser. Given a natural language description of a group expense, extract structured data.

Rules:
- Extract: who paid, total amount, participants, excluded people, split method (default = equal).
- If the payer is also a participant, include them.
- Always split equally unless specified otherwise.
- Amount should be a number (no currency symbols).
- If input is unclear or missing critical info, set "clarification_needed" to a question string.
- Do NOT guess names that aren't mentioned.

You MUST call the parse_expense function with the extracted data.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Description is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_expense",
              description: "Extract structured expense data from natural language",
              parameters: {
                type: "object",
                properties: {
                  paid_by: { type: "string", description: "Name of the person who paid" },
                  amount: { type: "number", description: "Total amount paid" },
                  participants: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of all participants (including payer if they participated)",
                  },
                  excluded: {
                    type: "array",
                    items: { type: "string" },
                    description: "People explicitly excluded",
                  },
                  split_method: {
                    type: "string",
                    enum: ["equal", "custom"],
                    description: "How to split the expense",
                  },
                  description: { type: "string", description: "Brief description of the expense" },
                  clarification_needed: {
                    type: "string",
                    description: "Question to ask if input is unclear. Null if input is clear.",
                  },
                },
                required: ["paid_by", "amount", "participants", "split_method", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "parse_expense" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-expense error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
