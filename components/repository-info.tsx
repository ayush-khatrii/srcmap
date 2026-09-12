"use client";

import { ChevronDown, ExternalLink, FolderGit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import type { RepositoryTreeResponse } from "@/lib/github-types";

type RepositoryInfoProps = {
  repository: RepositoryTreeResponse["repository"];
};

export function RepositoryInfo({ repository }: RepositoryInfoProps) {
  const owner = repository.owner || repository.fullName.split("/")[0];
  const ownerUrl = repository.ownerUrl || `https://github.com/${encodeURIComponent(owner)}`;
  const details = [
    { label: "License", value: repository.license || "Not specified" },
    { label: "Created", value: repository.createdAt?.slice(0, 10) || "Not available" },
    { label: "Last push", value: repository.pushedAt?.slice(0, 10) || "Not available" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-full min-w-0 justify-start gap-2 px-2 text-left"
          aria-label={`Repository details for ${repository.fullName}`}
          title={repository.fullName}
        >
          <Avatar className="size-7">
            <AvatarImage src={repository.ownerAvatarUrl} alt="" />
            <AvatarFallback>{owner.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[11px] font-normal text-muted-foreground">{owner}</span>
            <span className="block truncate text-sm font-semibold">{repository.name}</span>
          </span>
          <ChevronDown aria-hidden="true" className="text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FolderGit2 aria-hidden="true" className="size-4" />Current repository
          </p>
          <DialogTitle className="break-all text-xl">{repository.fullName}</DialogTitle>
          <DialogDescription className="break-words leading-6">
            {repository.description || "This repository has no description."}
          </DialogDescription>
        </DialogHeader>

        <a
          href={ownerUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex min-w-0 items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="size-10">
            <AvatarImage src={repository.ownerAvatarUrl} alt="" />
            <AvatarFallback>{owner.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">
              {repository.ownerType === "Organization" ? "Owner · Organization" : "Repository owner"}
            </span>
            <span className="block truncate text-sm font-medium">{owner}</span>
          </span>
          <ExternalLink aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Open owner profile on GitHub</span>
        </a>

        <dl className="my-5 space-y-3 text-sm">
          {details.map((detail) => (
            <div key={detail.label} className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted-foreground">{detail.label}</dt>
              <dd className="min-w-0 break-words text-right">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t pt-4">
          <p className="mb-3 break-all text-xs text-muted-foreground">{repository.url}</p>
          <Button asChild className="w-full">
            <a href={repository.url} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" />Open repository on GitHub
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
