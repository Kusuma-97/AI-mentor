const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

type Msg = { role: "user" | "assistant"; content: string };

export async function streamChat({
  endpoint,
  messages,
  extra,
  signal,
  onDelta,
  onDone,
}: {
  endpoint: string;
  messages?: Msg[];
  extra?: Record<string, unknown>;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, ...extra }),
    signal,
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    let errorMsg = "Request failed";
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) { try { await reader.cancel(); } catch {} ; throw new DOMException("Aborted", "AbortError"); }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } finally {
    try { reader.releaseLock(); } catch {}
  }
}

export async function invokeFunction<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const resp = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    let msg = "Request failed";
    try { msg = JSON.parse(text).error || msg; } catch {}
    throw new Error(msg);
  }
  return resp.json();
}
