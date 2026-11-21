"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CodeXml,
  ExternalLink,
  LoaderCircle,
  MoveRight,
  Pause,
  PencilLine,
  Play,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { GeminiError, streamTurn, type Content, type Part } from "@/lib/tutor/gemini";
import {
  ANSWER_LANGUAGES,
  stepContextText,
  systemPrompt,
  type StepContext,
} from "@/lib/tutor/prompt";
import {
  PAGES,
  runTool,
  toolDeclarations,
  type ActionKind,
  type ActionLog,
  type AgentHost,
  type AgentInput,
} from "@/lib/tutor/agent";
import { useCodeTab } from "@/hooks/useCodeTab";
import { useTutorSettings } from "@/hooks/useTutorSettings";
import { Markdown } from "@/components/tutor/Markdown";
import { TutorSetup } from "@/components/tutor/TutorSetup";

type Item = { kind: "text"; text: string } | { kind: "action"; log: ActionLog };

type Message = {
  id: number;
  role: "user" | "model";
  /** User question (or a hidden instruction when `hidden`). */
  text?: string;
  /** 1-based step the question was asked on. */
  step?: number;
  hidden?: boolean;
  items?: Item[];
  error?: { text: string; action?: "update-key" };
};

export type TutorAgentProps = {
  frames: { caption: string; note: string }[];
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  input: AgentInput;
};

type TutorPanelProps = {
  context: StepContext;
  agent: TutorAgentProps;
};

/** Earlier messages sent along with a new question, to keep follow-ups cheap. */
const HISTORY = 8;
/** Safety cap on act → observe rounds per question. */
const MAX_ROUNDS = 6;
const HANDOFF_KEY = "algothrive:tutor-handoff";
const HANDOFF_TTL_MS = 30_000;

type Handoff = { messages: Message[]; question: string; page: string; at: number };

const ACTION_ICONS: Record<ActionKind, LucideIcon> = {
  step: MoveRight,
  search: Search,
  play: Play,
  pause: Pause,
  input: PencilLine,
  code: CodeXml,
  open: ExternalLink,
  error: TriangleAlert,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

function describeError(e: unknown): Message["error"] {
  if (!(e instanceof GeminiError)) {
    return { text: "Something went wrong while answering. Please try again." };
  }
  switch (e.kind) {
    case "invalid-key":
      return {
        text: "Google says your key isn't valid anymore. It may have been deleted.",
        action: "update-key",
      };
    case "quota":
      return {
        text: `You've reached Gemini's free limit for now. ${
          e.retryAfter ? `Try again in about ${e.retryAfter} seconds.` : "Try again in a minute."
        } Daily limits reset at midnight US Pacific time (early afternoon in India).`,
      };
    case "permission":
      return { text: "This key isn't allowed to use the Gemini API.", action: "update-key" };
    case "model":
      return {
        text: "The Gemini model this key was using is no longer available. Reconnect to pick a new one.",
        action: "update-key",
      };
    case "blocked":
      return { text: "Gemini declined to answer that one. Try rephrasing the question." };
    case "network":
      return { text: e.message };
    default:
      return { text: e.message };
  }
}

/** Flattens a model message (text + actions) for the conversation history. */
function modelText(m: Message): string {
  return (m.items ?? [])
    .map((it) => (it.kind === "text" ? it.text : `[I did: ${it.log.label}]`))
    .join("\n")
    .trim();
}

function readHandoff(): Handoff | null {
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const h = JSON.parse(raw) as Handoff;
    return Date.now() - h.at < HANDOFF_TTL_MS ? h : null;
  } catch {
    return null;
  }
}

export function TutorPanel({ context, agent }: TutorPanelProps) {
  const router = useRouter();
  const [settings, updateSettings] = useTutorSettings();
  const [codeTab, setCodeTab] = useCodeTab();
  const connected = Boolean(settings.apiKey && settings.model);

  // The tutor floats over the page. It stays mounted while closed, so an
  // answer in progress keeps streaming and the chat is still there on reopen.
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const openRef = useRef(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(1);

  // Tools act on the visualizer and then read what changed, so keep the
  // newest props and messages reachable from inside the async agent loop.
  const latest = useRef({ context, agent, codeTab, messages });
  useEffect(() => {
    latest.current = { context, agent, codeTab, messages };
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    openRef.current = open;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const patchAnswer = (id: number, fn: (items: Item[]) => Item[]) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, items: fn(m.items ?? []) } : m)));

  const host: AgentHost = {
    frames: () => latest.current.agent.frames,
    currentIndex: () => latest.current.context.stepIndex,
    goTo: (i) => latest.current.agent.goTo(i),
    play: () => latest.current.agent.play(),
    pause: () => latest.current.agent.pause(),
    setSpeed: (s) => latest.current.agent.setSpeed(s),
    setCodeTab,
    get input() {
      return latest.current.agent.input;
    },
    snapshot: async () => {
      await nextFrame();
      return latest.current.context;
    },
  };

  const ask = async (question: string, opts: { hidden?: boolean; base?: Message[] } = {}) => {
    const q = question.trim();
    if (!q || busy || !settings.apiKey || !settings.model) return;
    agent.pause();
    if (!opts.hidden) setInput("");

    const base = opts.base ?? messages;
    const ctx = latest.current.context;
    const userMsg: Message = {
      id: nextId.current++,
      role: "user",
      text: q,
      step: ctx.stepIndex + 1,
      hidden: opts.hidden,
    };
    const answerId = nextId.current++;

    // Earlier exchanges go as plain text (the API only checks signatures
    // within the current question); only the new question carries full state.
    const history: Content[] = base
      .filter((m) => !m.error)
      .slice(-HISTORY)
      .map((m): Content =>
        m.role === "user"
          ? { role: "user", parts: [{ text: m.hidden ? m.text! : `(asked at step ${m.step}) ${m.text}` }] }
          : { role: "model", parts: [{ text: modelText(m) || "(no answer)" }] },
      );
    while (history[0]?.role === "model") history.shift();
    const contents: Content[] = [
      ...history,
      {
        role: "user",
        parts: [{ text: `${stepContextText(ctx, latest.current.codeTab)}\n\n## Student's question\n${q}` }],
      },
    ];

    setMessages([...base, userMsg, { id: answerId, role: "model", items: [] }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const turn = await streamTurn({
          key: settings.apiKey,
          model: settings.model,
          system: systemPrompt(settings.language),
          contents,
          tools: toolDeclarations(latest.current.agent.input),
          signal: controller.signal,
          onText: (t) =>
            patchAnswer(answerId, (items) => {
              const last = items.at(-1);
              return last?.kind === "text"
                ? [...items.slice(0, -1), { kind: "text", text: last.text + t }]
                : [...items, { kind: "text", text: t }];
            }),
        });

        const calls = turn.parts.filter((p) => p.functionCall);
        if (calls.length === 0) break;

        // The model's turn goes back exactly as received (signatures included).
        contents.push({ role: "model", parts: turn.parts });
        const results: Part[] = [];
        let navigateTo: string | undefined;
        for (const p of calls) {
          if (controller.signal.aborted) return;
          const out = await runTool(p.functionCall!, host);
          patchAnswer(answerId, (items) => [...items, { kind: "action", log: out.log }]);
          results.push(out.part);
          if (out.navigatedTo) {
            navigateTo = out.navigatedTo;
            break;
          }
          await sleep(350); // let the student see each action land
        }

        if (navigateTo) {
          // Hand the conversation to the next page, which finishes the answer.
          await nextFrame();
          const page = PAGES.find((pg) => navigateTo!.startsWith(`/${pg.path}`))?.name ?? "the new page";
          const handoff: Handoff = {
            messages: latest.current.messages.filter((m) => !m.error),
            question: q,
            page,
            at: Date.now(),
          };
          try {
            window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
          } catch {
            // Without storage the new page simply starts a fresh chat.
          }
          router.push(navigateTo);
          return;
        }
        contents.push({ role: "user", parts: results });
      }
      patchAnswer(answerId, (items) => (items.length ? items : [{ kind: "text", text: "Done." }]));
      if (opts.hidden) {
        try {
          window.sessionStorage.removeItem(HANDOFF_KEY);
        } catch {
          // ignore
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((prev) => prev.map((m) => (m.id === answerId ? { ...m, error: describeError(e) } : m)));
      }
    } finally {
      setBusy(false);
      if (abortRef.current === controller) abortRef.current = null;
      // Finished while the popup was closed: flag it on the launcher.
      if (!openRef.current && !controller.signal.aborted) setUnread(true);
    }
  };

  // Arriving from open_algorithm: restore the chat and let the tutor continue here.
  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  });
  useEffect(() => {
    if (!connected) return;
    const handoff = readHandoff();
    if (!handoff) return;
    // The student was mid-conversation: reopen the popup so they see it continue.
    openRef.current = true;
    setOpen(true);
    const restored = handoff.messages.map((m) => ({ ...m, id: nextId.current++ }));
    askRef.current(
      `[The tutor just opened ${handoff.page} for the student.] Continue answering the student's question on this page, using what is on screen now: "${handoff.question}"`,
      { hidden: true, base: restored },
    );
  }, [connected]);

  const stop = () => abortRef.current?.abort();
  const suggestions = ["Why is this step happening?", ...agent.input.suggestions];
  const visible = messages.filter((m) => !m.hidden);

  const openPopup = () => {
    setUnread(false);
    setOpen(true);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openPopup}
          aria-haspopup="dialog"
          aria-expanded={false}
          aria-controls="ai-tutor-popup"
          className="ink-lift fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full border border-foreground/80 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
        >
          <Sparkles className="size-4" />
          Ask AI tutor
          {(busy || unread) && (
            <span
              role="status"
              aria-label={busy ? "Tutor is working" : "New answer"}
              className={`absolute -top-1 -right-1 size-3.5 rounded-full border-2 border-background bg-destructive ${
                busy ? "animate-pulse" : ""
              }`}
            />
          )}
        </button>
      )}

      {open && (
        <section
          id="ai-tutor-popup"
          role="dialog"
          aria-label="AI tutor"
          className="paper-sheet fixed inset-x-2 bottom-2 z-50 flex max-h-[65dvh] flex-col overflow-hidden rounded-xl shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-h-[min(40rem,calc(100dvh-2rem))] sm:w-[27rem]"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-dashed border-border px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background">
              <Sparkles className="size-4 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="heading-slab text-base">AI tutor</span>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                  optional
                </span>
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {connected ? `Step ${context.stepIndex + 1} of ${context.totalSteps}` : "Runs on your own free Gemini key"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close tutor"
              className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </header>

          {!connected || replacing !== null ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <TutorSetup
                reason={replacing || undefined}
                onCancel={connected ? () => setReplacing(null) : undefined}
                onConnected={(apiKey, model) => {
                  updateSettings({ apiKey, model });
                  setReplacing(null);
                }}
              />
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                aria-live="polite"
                className="min-h-24 flex-1 space-y-3 overflow-y-auto p-4"
              >
                {visible.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Pause on any step and ask about it. I can also jump to steps, load inputs, switch
                    the code language and replay the animation for you — it all happens on the page
                    behind this window.
                  </p>
                ) : (
                  visible.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-lg border border-foreground/20 bg-primary/10 px-3 py-2 text-sm">
                          <span className="mr-2 font-mono text-[10px] text-muted-foreground uppercase">
                            step {m.step}
                          </span>
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <AnswerBubble
                        key={m.id}
                        message={m}
                        busy={busy && m.id === messages.at(-1)?.id}
                        onUpdateKey={() => setReplacing("Paste a new key to keep using the tutor.")}
                      />
                    ),
                  )
                )}
              </div>

              <div className="shrink-0 space-y-3 border-t border-dashed border-border p-4">
                <div
                  className={
                    visible.length === 0
                      ? "flex flex-wrap gap-2"
                      : "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 whitespace-nowrap"
                  }
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={busy}
                      onClick={() => ask(s)}
                      className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(input);
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={agent.pause}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        ask(input);
                      }
                    }}
                    rows={2}
                    maxLength={500}
                    placeholder={`Ask about step ${context.stepIndex + 1}, or say "show me…"`}
                    aria-label="Your question"
                    className="min-w-0 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  {busy ? (
                    <button
                      type="button"
                      onClick={stop}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm font-bold"
                    >
                      <Square className="size-4" /> Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="ink-lift inline-flex items-center gap-2 rounded-md border border-foreground/80 bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_0_var(--ink)] disabled:opacity-50"
                    >
                      <Send className="size-4" /> Ask
                    </button>
                  )}
                </form>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    Answer in
                    <span className="inline-flex overflow-hidden rounded-md border border-border">
                      {ANSWER_LANGUAGES.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={settings.language === key}
                          onClick={() => updateSettings({ language: key })}
                          className={`px-2 py-0.5 font-bold ${
                            settings.language === key
                              ? "bg-primary text-primary-foreground"
                              : "bg-background hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </span>
                  </span>
                  <span className="ml-auto flex gap-3">
                    {visible.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          stop();
                          setMessages([]);
                        }}
                        className="inline-flex items-center gap-1 font-bold hover:text-foreground"
                      >
                        <Trash2 className="size-3.5" /> Clear
                      </button>
                    )}
                    <button
                      type="button"
                      title={`Gemini · ${settings.model}`}
                      onClick={() => {
                        stop();
                        setMessages([]);
                        updateSettings({ apiKey: null, model: null }); // popup stays open on the setup screen
                      }}
                      className="font-bold hover:text-foreground"
                    >
                      Remove key
                    </button>
                  </span>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}

function AnswerBubble({
  message,
  busy,
  onUpdateKey,
}: {
  message: Message;
  busy: boolean;
  onUpdateKey: () => void;
}) {
  const items = message.items ?? [];
  return (
    <div className="max-w-[95%] space-y-2">
      {items.map((it, i) =>
        it.kind === "text" ? (
          <Markdown key={i} text={it.text} />
        ) : (
          <ActionChip key={i} log={it.log} />
        ),
      )}
      {busy && !message.error && (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {items.at(-1)?.kind === "action" ? "Looking at the result…" : items.length ? "" : "Thinking…"}
        </p>
      )}
      {message.error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm"
        >
          <p className="font-bold">{message.error.text}</p>
          {message.error.action === "update-key" && (
            <button
              type="button"
              onClick={onUpdateKey}
              className="mt-2 rounded-md border border-border bg-background px-3 py-1 text-xs font-bold"
            >
              Update key
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ActionChip({ log }: { log: ActionLog }) {
  const Icon = ACTION_ICONS[log.kind];
  return (
    <div
      className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] ${
        log.kind === "error"
          ? "border-destructive/50 text-destructive"
          : "border-primary/40 bg-primary/5 text-foreground"
      }`}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{log.label}</span>
    </div>
  );
}
