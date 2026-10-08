"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Show, useClerk, UserButton } from "@clerk/nextjs";
import { Bot, Check, Copy, LogIn, Menu, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Header({ aiOpen, onToggleAi, fileContent, hasFile, canShare, onShare, onSearch }: {
  aiOpen: boolean;
  onToggleAi: () => void;
  fileContent?: string;
  hasFile: boolean;
  canShare: boolean;
  onShare: () => void;
  onSearch: () => void;
}) {
  const { openSignIn } = useClerk();
  const pendingAction = useRef<(() => void) | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => { setCopyStatus("idle"); }, [fileContent]);
  useEffect(() => {
    if (copyStatus === "idle") return;
    const timeout = setTimeout(() => setCopyStatus("idle"), 2000);
    return () => clearTimeout(timeout);
  }, [copyStatus]);

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-chrome px-3 sm:px-5">
      <Link href="/" aria-label="Srcmap home" className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Image src="/logo.svg" alt="" width={30} height={30} priority className="size-7 rounded-md" />
        <span className="font-mono text-base font-semibold tracking-tight">srcmap</span>
      </Link>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Show when="signed-in"><UserButton appearance={{ elements: { avatarBox: "size-8" } }} /></Show>
        <Button variant="outline" aria-label="Toggle AI chat" aria-pressed={aiOpen} onClick={onToggleAi} className={cn("h-8 gap-1.5 px-2 text-xs sm:px-3", aiOpen && "bg-accent")}><Bot className="size-4" /><span>Ask AI</span></Button>
        <Show when="signed-out">
          <Button onClick={() => openSignIn()} className="hidden md:inline-flex">
            <LogIn />Sign in
          </Button>
        </Show>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button id="workspace-actions-trigger" variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Open workspace actions" title="Workspace actions"><Menu className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" collisionPadding={12} className="w-56 max-w-[calc(100vw-1.5rem)]" onCloseAutoFocus={(event) => {
            const action = pendingAction.current;
            pendingAction.current = null;
            if (action) { event.preventDefault(); action(); }
          }}>
            <DropdownMenuItem className="min-h-10" disabled={fileContent === undefined} onSelect={(event) => {
              event.preventDefault();
              navigator.clipboard?.writeText(fileContent ?? "").then(() => setCopyStatus("copied"), () => setCopyStatus("failed"));
              if (!navigator.clipboard) setCopyStatus("failed");
            }}>{copyStatus === "copied" ? <Check /> : <Copy />}<span aria-live="polite">{copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed — try again" : "Copy file"}</span></DropdownMenuItem>
            <DropdownMenuItem className="min-h-10" disabled={!canShare} onSelect={() => { pendingAction.current = onShare; }}><Share2 />Share this view</DropdownMenuItem>
            <DropdownMenuItem className="min-h-10" disabled={!hasFile} onSelect={() => { pendingAction.current = onSearch; }}><Search />Search in file</DropdownMenuItem>
            <Show when="signed-out">
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem className="min-h-10 md:hidden" onSelect={() => { pendingAction.current = () => openSignIn(); }}><LogIn />Sign in</DropdownMenuItem>
              {/* <DropdownMenuSeparator /> */}
            </Show>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
