"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUp, Bot, FileCode2, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; content: string };

export function AiSidechat({ open, onOpenChange, repository, snippet, attachments = [], onRemoveAttachment, onOpenFile }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository?: { fullName: string; url: string; description: string | null; readme?: string; packageJson?: string };
  snippet?: string;
  attachments?: { path: string; code: string; startLine?: number; endLine?: number }[];
  onRemoveAttachment?: (path: string) => void;
  onOpenFile?: (path: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (attachments.length) setPrompt((current) => current || "Explain the attached code:");
  }, [attachments.length]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = prompt.trim();
    if (!question || loading) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setPrompt("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, snippet: attachments.map((item) => `File: ${item.path}${item.startLine ? ` (line ${item.startLine})` : ""}\n${item.code}`).join("\n\n") || snippet, attachments, repository }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI request failed.");
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setMessages([...next, { role: "assistant", content: error instanceof Error ? error.message : "AI request failed." }]);
    } finally { setLoading(false); }
  }

  if (!open) return null;
  return <section className="absolute inset-y-0 right-0 z-30 flex w-[min(100%,430px)] flex-col border-l bg-background shadow-2xl lg:top-14" aria-label="AI code chat">
    <header className="flex items-start justify-between border-b px-4 py-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-primary" />SrcmapAI - code chat</h2>
        <p className="mt-1 text-xs text-muted-foreground">Ask about code with repository context.</p>
        {/* <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
          <Bot className="size-3.5" />DeepSeek
        </div> */}
      </div>
      <Button variant="ghost" size="icon" className="size-8" onClick={() => onOpenChange(false)} aria-label="Close AI chat"><X className="size-4" />
      </Button>
    </header>
    <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
      {messages.length === 0 && <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Explain a snippet or ask a question</p>
        <p className="mt-1">Paste code in the box below. {repository ? `Context: ${repository.fullName}.` : "Repository context will be included when available."}</p>
      </div>}
      {messages.map((message, index) => <div key={index} className={`whitespace-pre-wrap rounded-xl px-3.5 py-3 text-sm ${message.role === "user" ? "ml-8 bg-primary text-primary-foreground" : "mr-4 border bg-muted/40"}`}>{message.content}</div>)}
      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Thinking…</div>}
    </div>
    <form onSubmit={send} className="border-t p-3">
      {attachments.length > 0 && <div className="mb-2 flex flex-wrap gap-1.5">
        {attachments.map((item) => <span key={`${item.path}:${item.startLine ?? 0}`} className="inline-flex max-w-full items-center gap-1 rounded-full border bg-muted/50 py-1 pl-2.5 pr-1 text-[11px] shadow-sm">
          <button type="button" onClick={() => onOpenFile?.(item.path)} title={`Open ${item.path}`} className="flex min-w-0 items-center gap-1.5 hover:text-primary"><FileCode2 className="size-3 shrink-0 text-primary" /><span className="truncate font-mono">{item.path.split("/").pop()}</span>{item.startLine && <span className="shrink-0 text-muted-foreground">L{item.startLine}</span>}</button>
          <button type="button" onClick={() => onRemoveAttachment?.(item.path)} className="rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label={`Remove ${item.path}`}><X className="size-3" /></button>
        </span>)}
      </div>}
      {!attachments.length && snippet && <p className="mb-2 truncate text-xs text-muted-foreground">Current file included as context</p>}
      <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
        }} placeholder="Paste code or ask a question…" aria-label="Message AI" rows={3} className="max-h-40 min-h-16 min-w-0 flex-1 resize-y bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground" />
        <Button type="submit" size="icon" className="size-9 shrink-0 rounded-lg" disabled={!prompt.trim() || loading} aria-label="Send message"><ArrowUp className="size-4" /></Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">DeepSeek • Responses may need review</p>
    </form>
  </section>;
}
