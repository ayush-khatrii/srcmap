"use client";

import { Children, FormEvent, isValidElement, type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowUp, FileCode2, LoaderCircle, PanelRightClose, Sparkles, X } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { BundledLanguage } from "@/components/kibo-ui/code-block";
import {
  CodeBlock, CodeBlockBody, CodeBlockContent, CodeBlockCopyButton,
  CodeBlockFilename, CodeBlockHeader, CodeBlockItem,
} from "@/components/kibo-ui/code-block";

type Message = { role: "user" | "assistant"; content: string };

const languageAliases: Record<string, BundledLanguage> = {
  bash: "bash", sh: "bash", shell: "bash", js: "javascript", javascript: "javascript",
  jsx: "jsx", ts: "typescript", typescript: "typescript", tsx: "tsx", json: "json",
  html: "html", css: "css", scss: "scss", md: "markdown", markdown: "markdown",
  py: "python", python: "python", go: "go", rust: "rust", rs: "rust", java: "java",
  sql: "sql", yaml: "yaml", yml: "yaml", xml: "xml", text: "text" as BundledLanguage, plaintext: "text" as BundledLanguage,
};

function MarkdownCodeBlock({ children }: { children?: ReactNode }) {
  const codeElement = Children.toArray(children).find(isValidElement) as ReactElement<{
    className?: string;
    children?: ReactNode;
  }> | undefined;
  const className = codeElement?.props.className ?? "";
  const languageName = /language-([\w+#.-]+)/.exec(className)?.[1]?.toLowerCase() ?? "text";
  const language = languageAliases[languageName] ?? ("text" as BundledLanguage);
  const source = String(codeElement?.props.children ?? "").replace(/\n$/, "");
  const data = [{ language, filename: languageName, code: source }];

  return (
    <CodeBlock data={data} defaultValue={language} className="my-3 w-full max-w-full rounded-lg border bg-muted/20 text-xs">
      <CodeBlockHeader className="min-h-8 bg-muted/50 px-2">
        <CodeBlockFilename value={language} className="text-[11px]">{languageName}</CodeBlockFilename>
        <CodeBlockCopyButton className="ml-auto size-7" aria-label="Copy code example" />
      </CodeBlockHeader>
      <CodeBlockBody>
        {(item) => <CodeBlockItem key={item.language} value={item.language}>
          <CodeBlockContent language={item.language as BundledLanguage} className="max-w-full overflow-x-auto text-xs [&_pre]:py-3">
            {item.code}
          </CodeBlockContent>
        </CodeBlockItem>}
      </CodeBlockBody>
    </CodeBlock>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-4 text-sm font-semibold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-sm font-semibold">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-6 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-primary/40 pl-3 text-muted-foreground">{children}</blockquote>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">{children}</a>,
  hr: () => <hr className="my-4 border-border/60" />,
  table: ({ children }) => <div className="my-3 max-w-full overflow-x-auto"><table className="w-full border-collapse text-left text-xs">{children}</table></div>,
  th: ({ children }) => <th className="border-b px-2 py-1.5 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-border/50 px-2 py-1.5">{children}</td>,
  code: ({ children, className }) => className
    ? <code className={className}>{children}</code>
    : <code className="rounded bg-muted/70 px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
  pre: ({ children }) => <MarkdownCodeBlock>{children}</MarkdownCodeBlock>,
};

function AssistantMarkdown({ content }: { content: string }) {
  return <div className="min-w-0 break-words text-sm leading-6 [&_strong]:font-semibold [&_strong]:text-foreground">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown>
  </div>;
}

export function AiSidechat({ open, onOpenChange, repository, snippet, attachments = [], onRemoveAttachment, onOpenFile }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository?: { fullName: string; url: string; description: string | null; readme?: string; packageJson?: string };
  snippet?: string;
  attachments?: { path: string; code: string; startLine?: number; endLine?: number }[];
  onRemoveAttachment?: (path: string) => void;
  onOpenFile?: (path: string) => void;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => {
      setIsDesktop(query.matches);
      if (!query.matches) onOpenChange(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [onOpenChange]);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, loading]);
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

  const content = <>
    <header className="flex h-12 shrink-0 items-center gap-2.5 border-b px-4">
      <Sparkles className="size-4 text-primary" /><h2 className="text-xs font-semibold">AI code chat</h2><span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary">AI</span>
      <Button variant="ghost" size="icon" className="ml-auto size-7 text-muted-foreground" onClick={() => onOpenChange(false)} aria-label="Close AI chat"><PanelRightClose className="size-3.5" /></Button>
    </header>
    <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 text-[10px] text-muted-foreground"><span className={`size-1.5 shrink-0 rounded-full ${repository ? "bg-primary" : "bg-muted-foreground"}`} /><span className="truncate">{repository ? `Context: ${repository.fullName}` : "Open a repository to add context"}</span></div>
    <div ref={messagesRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-6" aria-live="polite" aria-busy={loading}>
      {messages.length === 0 && <div className="rounded-lg border bg-background/50 p-4">
        <h3 className="text-sm font-medium">Explain a snippet or ask a question</h3>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">Paste code below or attach an open file. Repository context is included when available.</p>
      </div>}
      {messages.map((message, index) => message.role === "user"
        ? <div key={index} className="ml-auto w-fit max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-tr-sm border border-primary/15 bg-primary/10 px-3.5 py-2.5 text-xs leading-6 text-foreground">{message.content}</div>
        : <div key={index} className="w-full min-w-0 py-1 text-foreground"><div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-primary"><Sparkles className="size-3" />Companion</div><AssistantMarkdown content={message.content} /></div>)}
      {loading && <div role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin text-primary" />Thinking…</div>}
    </div>
    <form onSubmit={send} className="shrink-0 border-t border-border/60 p-3">
      {attachments.length > 0 && <div className="mb-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
        {attachments.map((item) => <span key={`${item.path}:${item.startLine ?? 0}`} className="inline-flex max-w-full items-center gap-1 rounded-md border bg-background/50 py-1 pl-2 pr-1 text-[10px]">
          <button type="button" onClick={() => onOpenFile?.(item.path)} title={`Open ${item.path}`} className="flex min-w-0 items-center gap-1.5 hover:text-primary"><FileCode2 className="size-3 shrink-0 text-primary" /><span className="truncate font-mono">{item.path.split("/").pop()}</span>{item.startLine && <span className="shrink-0 text-muted-foreground">L{item.startLine}</span>}</button>
          <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveAttachment?.(item.path)} className="size-5 text-muted-foreground" aria-label={`Remove ${item.path}`}><X className="size-3" /></Button>
        </span>)}
      </div>}
      {!attachments.length && snippet && <p className="mb-2 flex items-center gap-1.5 truncate text-[10px] text-muted-foreground"><FileCode2 className="size-3 text-primary" />Current file included as context</p>}
      <div className="rounded-xl border bg-background/70 p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
        <textarea id="ai-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
        }} placeholder="Ask about this code…" aria-label="Message AI" rows={3} className="max-h-40 min-h-16 w-full resize-y bg-transparent px-1.5 py-1 text-xs leading-6 outline-none placeholder:text-muted-foreground" />
        {/* <div className="flex items-center justify-between px-1"><span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="size-1 rounded-full bg-primary" />DeepSeek</span><Button type="submit" size="icon" className="size-7 rounded-lg" disabled={!prompt.trim() || loading} aria-label="Send message"><ArrowUp className="size-3.5" /></Button></div> */}
      </div>
      <p className="mt-2 text-center text-[9px] text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
    </form>
  </>;

  if (isDesktop) return open ? <aside aria-label="AI code chat" className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-l bg-assistant 2xl:w-[352px]">{content}</aside> : null;
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" showCloseButton={false} className="gap-0 bg-assistant p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-sm"><SheetHeader className="sr-only"><SheetTitle>AI code chat</SheetTitle><SheetDescription>Ask questions about your repository and code.</SheetDescription></SheetHeader>{content}</SheetContent></Sheet>;
}
