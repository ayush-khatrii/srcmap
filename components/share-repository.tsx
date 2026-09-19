"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { createRepositoryUrl } from "@/lib/repository-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function ShareRepository({ repo, file, search, disabled }: {
  repo: string;
  file: string;
  search: string;
  disabled: boolean;
}) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyLink(url: string) {
    setCopied(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // The dialog still provides a selectable link if clipboard access fails.
    }
  }

  function share() {
    // Serialize the latest state, even if nuqs hasn't flushed its URL update yet.
    const url = createRepositoryUrl(window.location.origin + window.location.pathname, {
      repo, file, q: search,
    });
    setShareUrl(url);
    void copyLink(url);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" disabled={disabled} onClick={share}
          aria-label="Share repository and code search" title="Share repository and code search">
          <Share2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share this view</DialogTitle>
          <DialogDescription>
            This link opens the repository{file ? ", selected file" : ""}{search ? ", and code search" : ""}.
            It follows the repository’s current default branch.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input aria-label="Share link" value={shareUrl} readOnly
            onFocus={(event) => event.target.select()} className="min-w-0 flex-1" />
          <Button onClick={() => void copyLink(shareUrl)}>
            {copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p role="status" className="text-xs text-muted-foreground">
          {copied ? "Link copied to clipboard." : "Copy the link, or select it above to copy manually."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
