/**
 * Minimal browser client for the Gemini API, called directly with the
 * student's own key. Nothing goes through an AlgoThrive server.
 */

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type GeminiErrorKind =
  | "invalid-key"
  | "quota"
  | "permission"
  | "model"
  | "blocked"
  | "network"
  | "unknown";

export class GeminiError extends Error {
  constructor(
    public kind: GeminiErrorKind,
    message: string,
    /** Seconds Google asked us to wait, when it says. */
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

type ApiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: { "@type"?: string; reason?: string; retryDelay?: string }[];
  };
};

async function toGeminiError(res: Response): Promise<GeminiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // Non-JSON error body; fall through to the status code.
  }
  const err = body.error ?? {};
  const details = err.details ?? [];
  const reason = details.find((d) => d.reason)?.reason;
  const delay = details.find((d) => d.retryDelay)?.retryDelay;
  const retryAfter = delay ? Math.ceil(parseFloat(delay)) : undefined;
  const message = err.message ?? `Gemini returned HTTP ${res.status}.`;

  if (reason === "API_KEY_INVALID" || /api key not valid/i.test(message)) {
    return new GeminiError("invalid-key", message);
  }
  if (res.status === 429 || err.status === "RESOURCE_EXHAUSTED") {
    return new GeminiError("quota", message, retryAfter);
  }
  if (res.status === 403 || err.status === "PERMISSION_DENIED") {
    return new GeminiError("permission", message);
  }
  if (res.status === 404 || err.status === "NOT_FOUND") {
    return new GeminiError("model", message);
  }
  return new GeminiError("unknown", message);
}

async function call(
  path: string,
  key: string,
  init: RequestInit & { signal?: AbortSignal } = {},
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        // Header, not ?key=, so the key never lands in URLs or logs.
        "x-goog-api-key": key,
        ...init.headers,
      },
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new GeminiError("network", "Couldn't reach Google. Check your internet connection.");
  }
  if (!res.ok) throw await toGeminiError(res);
  return res;
}

/* ---------------- Model selection ---------------- */

type ModelInfo = { name: string; supportedGenerationMethods?: string[] };

/** Model names that can't do plain text chat, or may vanish without notice. */
const EXCLUDE = /(live|tts|image|audio|embedding|native|preview|exp|robotics|computer|veo|imagen|lyria|aqa)/i;

function version(id: string): number {
  const m = /^gemini-(\d+(?:\.\d+)?)/.exec(id);
  return m ? parseFloat(m[1]!) : 0;
}

/**
 * Orders text models best-first for a tutor: stable Flash-Lite (fast, generous
 * free tier), then Flash, then any other stable Gemini text model. Newest first
 * inside each group. Model names change often, so we rank what the key can see
 * instead of hardcoding one.
 */
export function rankModels(models: ModelInfo[]): string[] {
  const ids = models
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((id) => id.startsWith("gemini-") && !EXCLUDE.test(id));

  const group = (id: string) => (id.includes("flash-lite") ? 0 : id.includes("flash") ? 1 : 2);
  return [...new Set(ids)].sort(
    (a, b) =>
      group(a) - group(b) ||
      version(b) - version(a) ||
      // Prefer the alias ("gemini-x-flash") over pinned builds ("…-001").
      a.length - b.length,
  );
}

export async function listModels(key: string, signal?: AbortSignal): Promise<ModelInfo[]> {
  const out: ModelInfo[] = [];
  let pageToken = "";
  for (let page = 0; page < 10; page++) {
    const qs = `pageSize=100${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
    const res = await call(`models?${qs}`, key, { method: "GET", signal });
    const data = (await res.json()) as { models?: ModelInfo[]; nextPageToken?: string };
    out.push(...(data.models ?? []));
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return out;
}

/**
 * Verifies the key and finds a model it can actually use (some models have no
 * free-tier quota). Returns the chosen model id.
 */
export async function connect(key: string, signal?: AbortSignal): Promise<string> {
  const candidates = rankModels(await listModels(key, signal));
  if (candidates.length === 0) {
    throw new GeminiError("model", "This key can't see any Gemini text models.");
  }
  let lastError: unknown;
  for (const model of candidates.slice(0, 4)) {
    try {
      await call(`models/${model}:generateContent`, key, {
        method: "POST",
        signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Reply with the single word OK." }] }],
          generationConfig: { maxOutputTokens: 16 },
        }),
      });
      return model;
    } catch (e) {
      if (e instanceof GeminiError && (e.kind === "quota" || e.kind === "model")) {
        lastError = e;
        continue; // Try the next model.
      }
      throw e;
    }
  }
  throw lastError;
}

/* ---------------- Agent turns (streaming + function calling) ---------------- */

/** One piece of a turn. Sent back to the API exactly as received. */
export type Part = {
  text?: string;
  thought?: boolean;
  /** Newer models sign their turns; must be returned on the same part. */
  thoughtSignature?: string;
  functionCall?: { name: string; args?: Record<string, unknown>; id?: string };
  functionResponse?: { name: string; response: Record<string, unknown>; id?: string };
};

export type Content = { role: "user" | "model"; parts: Part[] };

/** Gemini's OpenAPI-subset schema. */
export type Schema = {
  type: "OBJECT" | "STRING" | "INTEGER" | "NUMBER" | "BOOLEAN" | "ARRAY";
  description?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: string[];
};

export type FunctionDeclaration = {
  name: string;
  description: string;
  parameters?: Schema;
};

type Chunk = {
  candidates?: { content?: { parts?: Part[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
};

/** Plain visible text with no signature can be merged with its neighbour. */
const isPlainText = (p: Part) =>
  typeof p.text === "string" && !p.thought && !p.thoughtSignature && !p.functionCall;

/**
 * Adds a streamed part to the turn. Plain text joins the previous plain-text
 * part; anything carrying a signature or a call stays its own part, because the
 * API rejects merged signed parts.
 */
function appendPart(parts: Part[], part: Part) {
  const last = parts.at(-1);
  if (last && isPlainText(last) && isPlainText(part)) {
    last.text += part.text!;
  } else {
    parts.push({ ...part });
  }
}

export type TurnResult = { parts: Part[]; finishReason?: string };

/**
 * Streams one model turn. Visible text is reported through `onText` as it
 * arrives; the full turn (text, function calls, signatures) is returned so it
 * can be sent back unmodified on the next request.
 */
export async function streamTurn(opts: {
  key: string;
  model: string;
  system: string;
  contents: Content[];
  tools?: FunctionDeclaration[];
  signal?: AbortSignal;
  onText?: (text: string) => void;
}): Promise<TurnResult> {
  const res = await call(`models/${opts.model}:streamGenerateContent?alt=sse`, opts.key, {
    method: "POST",
    signal: opts.signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: opts.contents,
      ...(opts.tools?.length ? { tools: [{ functionDeclarations: opts.tools }] } : {}),
      generationConfig: { maxOutputTokens: 2048 },
    }),
  });

  const parts: Part[] = [];
  let finishReason: string | undefined;
  const take = (chunk: Chunk) => {
    if (chunk.promptFeedback?.blockReason) {
      throw new GeminiError("blocked", "Gemini declined to answer that question.");
    }
    const candidate = chunk.candidates?.[0];
    if (candidate?.finishReason) finishReason = candidate.finishReason;
    for (const part of candidate?.content?.parts ?? []) {
      appendPart(parts, part);
      if (!part.thought && part.text) opts.onText?.(part.text);
    }
  };

  // Some proxies/browsers return plain JSON instead of SSE; handle both.
  if (!res.headers.get("content-type")?.includes("text/event-stream") || !res.body) {
    const data = (await res.json()) as Chunk | Chunk[];
    for (const chunk of Array.isArray(data) ? data : [data]) take(chunk);
  } else {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = done ? "" : (lines.pop() ?? "");
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        take(JSON.parse(payload) as Chunk);
      }
      if (done) break;
    }
  }

  if (finishReason === "MALFORMED_FUNCTION_CALL" || finishReason === "UNEXPECTED_TOOL_CALL") {
    throw new GeminiError("unknown", "The tutor tripped over its own action. Please ask again.");
  }
  if (finishReason === "MISSING_THOUGHT_SIGNATURE") {
    throw new GeminiError("unknown", "Gemini rejected the conversation state. Clear the chat and ask again.");
  }
  return { parts, finishReason };
}
