"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot, ExternalLink, FileCode2, FolderGit2, GitBranch, History,
  Menu, Plus, Search, Settings, Sparkles, Star, UserCircle,
} from "lucide-react";
import RepositoryTree from "@/components/repository-tree";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader,
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RepositoryTreeItem, RepositoryTreeResponse } from "@/lib/github-types";

async function fetchRepositoryTree(repoUrl: string): Promise<RepositoryTreeResponse> {
  const response = await fetch(`/api/src-tree?url=${encodeURIComponent(repoUrl)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Repository could not be loaded.");
  }

  return data;
}

function TreeSkeleton() {
  return (
    <div className="space-y-3 px-3 py-2">
      {[72, 55, 82, 64, 74, 48, 68, 58].map((width, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-3" style={{ width: `${width}%` }} />
        </div>
      ))}
    </div>
  );
}

type OpenRepositoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
};

function OpenRepositoryDialog({ open, onOpenChange, onSubmit }: OpenRepositoryDialogProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(url.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderGit2 aria-hidden="true" />
          </div>
          <DialogTitle>Open a public repository</DialogTitle>
          <DialogDescription>Paste a GitHub repository URL to explore its files.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <Input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://github.com/owner/repository"
            aria-label="GitHub repository URL"
            className="h-10"
            autoFocus
            required
          />
          <Button type="submit" className="h-10 w-full" disabled={!url.trim()}>
            <FolderGit2 aria-hidden="true" />Open repository
          </Button>
          <p className="text-center text-xs text-muted-foreground">Public repositories only</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type OperationsMenuProps = {
  repository?: RepositoryTreeResponse["repository"];
  onOpenRepository: () => void;
};

function OperationsMenu({ repository, onOpenRepository }: OperationsMenuProps) {
  const [open, setOpen] = useState(false);

  function openRepositoryDialog() {
    setOpen(false);
    onOpenRepository();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open workspace menu"><Menu /></Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b p-5 pr-14">
          <SheetTitle>Workspace</SheetTitle>
          <SheetDescription>Repository tools and account options</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-3 rounded-xl border bg-muted/40 p-3">
            <p className="truncate text-sm font-medium">{repository?.fullName ?? "No repository open"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {repository ? `Public repository · ${repository.branch}` : "Open a repository to begin"}
            </p>
          </div>

          <p className="px-2 py-2 text-xs font-medium text-muted-foreground">Repository</p>
          <Button variant="ghost" className="w-full justify-start" onClick={openRepositoryDialog}><Plus />Open another repository</Button>
          <Button variant="ghost" className="w-full justify-start"><Search />Search files</Button>
          <Button variant="ghost" className="w-full justify-start"><Star />Save repository</Button>
          <Button variant="ghost" className="w-full justify-start"><History />Recently viewed</Button>
          {repository && (
            <Button asChild variant="ghost" className="w-full justify-start">
              <a href={repository.url} target="_blank" rel="noreferrer"><ExternalLink />View on GitHub</a>
            </Button>
          )}

          <div className="my-3 h-px bg-border" />
          <p className="px-2 py-2 text-xs font-medium text-muted-foreground">Coming next</p>
          <Button variant="ghost" className="w-full justify-start" disabled><Sparkles />Explain with AI</Button>
          <Button variant="ghost" className="w-full justify-start" disabled><Bot />AI conversations</Button>

          <div className="my-3 h-px bg-border" />
          <Button variant="ghost" className="w-full justify-start"><UserCircle />Profile and usage</Button>
          <Button variant="ghost" className="w-full justify-start"><Settings />Settings</Button>
        </div>

        <SheetFooter className="border-t p-4">
          <div className="flex items-center justify-between rounded-lg border p-2">
            <span className="pl-2 text-sm">Appearance</span>
            <ThemeToggle className="size-8 text-muted-foreground" />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ExplorerWorkspace() {
  const [repoUrl, setRepoUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileSearch, setFileSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<RepositoryTreeItem | null>(null);

  const repositoryQuery = useQuery({
    queryKey: ["repository-tree", repoUrl],
    queryFn: () => fetchRepositoryTree(repoUrl),
    enabled: Boolean(repoUrl),
    retry: false,
    staleTime: Infinity,
  });

  function openRepository(url: string) {
    setSelectedItem(null);
    setFileSearch("");

    if (url === repoUrl) {
      repositoryQuery.refetch();
    } else {
      setRepoUrl(url);
    }
  }

  const tree = repositoryQuery.data?.tree ?? [];
  const search = fileSearch.trim().toLowerCase();
  const matchingPaths = tree
    .filter((item) => item.path.toLowerCase().includes(search))
    .map((item) => item.path);
  const visibleTree = search
    ? tree.filter((item) =>
        matchingPaths.includes(item.path) ||
        matchingPaths.some((path) => path.startsWith(`${item.path}/`)),
      )
    : tree;
  const repository = repositoryQuery.data?.repository;

  const metadata = repository ? [
    { label: "Repository", value: repository.fullName },
    { label: "Default branch", value: repository.branch },
    { label: "Primary language", value: repository.language ?? "Not detected" },
    { label: "Stars", value: repository.stars.toLocaleString() },
    { label: "Forks", value: repository.forks.toLocaleString() },
    { label: "Tree entries", value: tree.length.toLocaleString() },
  ] : [];

  return (
    <>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="h-14 flex-row items-center justify-between border-b px-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileCode2 /></span>
            <span className="truncate font-mono text-sm font-semibold">srcpeek<span className="font-normal text-muted-foreground">.dev</span></span>
          </div>
          <ThemeToggle className="size-8 shrink-0 text-muted-foreground" />
        </SidebarHeader>

        <div className="shrink-0 border-b p-3">
          <TabsList aria-label="File details" className="w-full">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
        </div>

        <div className="border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={fileSearch} onChange={(event) => setFileSearch(event.target.value)}
              placeholder="Find a file..." className="pl-8" disabled={!repository} />
          </div>
        </div>

        <SidebarContent>
          {repositoryQuery.isFetching && repoUrl && <TreeSkeleton />}

          {!repoUrl && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <FolderGit2 className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Open a repository to see its files.</p>
              <Button size="default" onClick={() => setDialogOpen(true)}><Plus />Open repository</Button>
            </div>
          )}

          {repositoryQuery.isError && (
            <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {repositoryQuery.error.message}
            </div>
          )}

          {repository && !repositoryQuery.isFetching && (
            <SidebarGroup className="p-2">
              <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-xs font-medium text-muted-foreground">
                <FolderGit2 className="size-4" />
                <span className="truncate">{repository.fullName}</span>
              </div>
              <RepositoryTree items={visibleTree} selectedPath={selectedItem?.path ?? null} onSelect={setSelectedItem} />
              {visibleTree.length === 0 && <p className="px-3 py-8 text-center text-xs text-muted-foreground">No files found</p>}
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="h-10 flex-row items-center border-t px-4 text-xs text-muted-foreground">
          <GitBranch className="size-3.5" />
          {repository?.branch ?? "No branch"}
          {repository && <span className="ml-auto">{tree.length} items</span>}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="h-dvh min-h-0 min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-1 border-b px-2 sm:px-3">
          <SidebarTrigger />
          <span className="mx-1 h-5 w-px bg-border" />
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1 text-sm">
            <FileCode2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">{selectedItem?.path ?? repository?.fullName ?? "Repository explorer"}</span>
          </div>
          <Button variant="outline" className="hidden md:inline-flex" disabled={!repository}><Search />Search</Button>
          <Button variant="secondary" className="hidden sm:inline-flex" disabled><Sparkles />Explain with AI</Button>
          <Button onClick={() => setDialogOpen(true)} className="hidden sm:inline-flex"><Plus />Open repository</Button>
          <Button onClick={() => setDialogOpen(true)} variant="ghost" size="icon" className="sm:hidden" aria-label="Open repository"><Plus /></Button>
          <OperationsMenu repository={repository} onOpenRepository={() => setDialogOpen(true)} />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          {!repoUrl && (
            <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-muted/40"><FolderGit2 className="size-6 text-muted-foreground" /></div>
              <h1 className="text-xl font-semibold">Explore a public repository</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Paste a GitHub URL and browse its complete file tree without downloading anything.</p>
              <Button className="mt-6" onClick={() => setDialogOpen(true)}><Plus />Open repository</Button>
            </div>
          )}

          {repositoryQuery.isFetching && repoUrl && (
            <div className="max-w-4xl space-y-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" /></div>
          )}

          {repositoryQuery.isError && (
            <div className="mx-auto max-w-lg rounded-xl border border-destructive/30 bg-destructive/10 p-5"><h2 className="font-medium text-destructive">Could not open repository</h2><p className="mt-1 text-sm text-muted-foreground">{repositoryQuery.error.message}</p><Button className="mt-4" onClick={() => setDialogOpen(true)}>Try another URL</Button></div>
          )}

          {repository && !repositoryQuery.isFetching && (
            <div className="w-full max-w-4xl">
              <TabsContent value="content" className="space-y-2">
                <h2 className="text-lg font-semibold">File content is coming soon</h2>
                <p className="text-sm text-muted-foreground">
                  You'll be able to read files here. For now, view their details in the Metadata tab.
                </p>
                {selectedItem && (
                  <p className="break-all font-mono text-sm text-muted-foreground">{selectedItem.path}</p>
                )}
              </TabsContent>

              <TabsContent value="metadata">
              <p className="text-sm text-muted-foreground">Public repository</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{repository.fullName}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{repository.description ?? "This repository has no description."}</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {metadata.map((item) => (
                  <div key={item.label} className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-medium" title={item.value}>{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedItem && (
                <div className="mt-6 rounded-xl border bg-card p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selected tree item</p>
                  <h2 className="mt-2 break-all font-mono text-sm font-medium">{selectedItem.path}</h2>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span>Type: {selectedItem.type === "blob" ? "File" : "Folder"}</span>
                    {selectedItem.size !== undefined && <span>Size: {selectedItem.size.toLocaleString()} bytes</span>}
                    <span className="truncate">SHA: {selectedItem.sha.slice(0, 12)}</span>
                  </div>
                </div>
              )}
              </TabsContent>
            </div>
          )}
        </main>
      </SidebarInset>

      <OpenRepositoryDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={openRepository} />
    </>
  );
}

export default function RepositoryExplorer() {
  return (
    <Tabs defaultValue="metadata" className="h-dvh gap-0">
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden bg-background">
        <ExplorerWorkspace />
      </SidebarProvider>
    </Tabs>
  );
}
