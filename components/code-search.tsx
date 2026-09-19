"use client";

import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CodeSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  hasFile: boolean;
  loading: boolean;
  failed: boolean;
  searching: boolean;
  matchCount: number;
  activeMatch: number;
  onNavigate: (direction: number) => void;
  className?: string;
};

export function CodeSearch({ value, onChange, onFocus, hasFile, loading, failed, searching,
  matchCount, activeMatch, onNavigate, className }: CodeSearchProps) {
  return (
    <div role="search" aria-label="Search selected file"
      className={cn(
        "flex h-9 min-w-0 items-center gap-1 rounded-lg border bg-muted/25 px-2 shadow-xs transition-colors focus-within:border-ring/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        aria-label="Search code in selected file (case-sensitive)"
        placeholder="Search code (case-sensitive)…"
        title="Find exact text in this file. Uppercase and lowercase letters are different."
        value={value}
        readOnly={!hasFile}
        onFocus={onFocus}
        onClick={() => { if (!hasFile) onFocus(); }}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onNavigate(event.shiftKey ? -1 : 1);
          }
          if (event.key === "Escape") onChange("");
        }}
        className="h-9 min-w-0 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent [&::-webkit-search-cancel-button]:hidden"
      />
      {value && <>
        <span role="status" className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
          {loading ? "Loading…" : failed ? "Unavailable" : searching ? "Searching…" : matchCount ? `${activeMatch + 1}/${matchCount}` : "No matches"}
        </span>
        <Button variant="ghost" size="icon" className="size-7" disabled={!matchCount || searching}
          aria-label="Previous match" title="Previous match (Shift+Enter)" onClick={() => onNavigate(-1)}><ArrowUp /></Button>
        <Button variant="ghost" size="icon" className="size-7" disabled={!matchCount || searching}
          aria-label="Next match" title="Next match (Enter)" onClick={() => onNavigate(1)}><ArrowDown /></Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Clear code search" onClick={() => onChange("")}><X /></Button>
      </>}
    </div>
  );
}
