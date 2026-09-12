"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot, ChevronDown, CircleDot, Code2, ExternalLink, FileCode2, FolderGit2, GitBranch,
  GitFork, HardDrive, History, Menu, Palette, Plus, Search, Settings,
  Sparkles, Star, UserCircle,
} from "lucide-react";
import { useCodeTheme } from "@/components/code-theme-provider";
import RepositoryTree from "@/components/repository-tree";
import { RepositoryInfo } from "@/components/repository-info";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CODE_THEMES } from "@/constants/code-themes";
import { cn } from "@/lib/utils";
import type { BundledLanguage } from "@/components/kibo-ui/code-block";
import {
  CodeBlock, CodeBlockBody, CodeBlockContent, CodeBlockCopyButton,
  CodeBlockFilename, CodeBlockHeader, CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import type {
  RepositoryFileResponse, RepositoryTreeItem, RepositoryTreeResponse,
} from "@/lib/github-types";

async function fetchRepositoryTree(repoUrl: string): Promise<RepositoryTreeResponse> {
  const response = await fetch(`/api/src-tree?url=${encodeURIComponent(repoUrl)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Repository could not be loaded.");
  }

  return data;
}

async function fetchFileContent(
  repo: string,
  sha: string,
  signal: AbortSignal,
): Promise<RepositoryFileResponse> {
  const params = new URLSearchParams({ repo, sha });
  const response = await fetch(`/api/src-content?${params}`, { signal });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "File content could not be loaded.");
  }

  return data;
}

function getLanguage(path: string): BundledLanguage {
  const filename = path.split("/").pop()?.toLowerCase() ?? "";
  const extension = filename.split(".").pop() ?? "";
  const languages: Record<string, BundledLanguage> = {
    js: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx",
    json: "json", css: "css", scss: "scss", html: "html",
    md: "markdown", mdx: "mdx", yml: "yaml", yaml: "yaml",
    sh: "bash", py: "python", java: "java", go: "go", rs: "rust",
    c: "c", cpp: "cpp", php: "php", rb: "ruby", sql: "sql",
  };

  if (filename === "dockerfile") return "dockerfile";
  return languages[extension] ?? "text";
}

function FilePreview({ file, content }: {
  file: RepositoryTreeItem;
  content: string;
}) {
  const language = getLanguage(file.path);
  const code = [{ language, filename: file.path, code: content }];

  return (
    <CodeBlock
      key={file.sha}
      data={code}
      value={language}
      className="flex !h-auto min-h-[calc(100dvh-3.5rem)] !w-full flex-col rounded-none border-0"
    >
      <CodeBlockHeader className="shrink-0">
        <CodeBlockFilename value={language}>{file.path}</CodeBlockFilename>
        <CodeBlockCopyButton className="ml-auto" aria-label="Copy file content" />
      </CodeBlockHeader>
      <CodeBlockBody className="flex flex-1 flex-col">
        {(item) => (
          <CodeBlockItem key={item.language} value={item.language} className="flex-1">
            <CodeBlockContent
              language={item.language as BundledLanguage}
              className="h-full [&_pre]:min-h-full"
            >
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
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

function CodeThemeSelector({ className }: { className?: string }) {
  const { codeTheme, setCodeTheme } = useCodeTheme();

  return (
    <Select value={codeTheme} onValueChange={setCodeTheme}>
      <SelectTrigger
        className={cn("bg-background/50", className)}
        aria-label="Syntax highlighting theme"
      >
        <Palette className="text-muted-foreground" />
        <SelectValue placeholder="Select code theme" />
      </SelectTrigger>
      <SelectContent align="start" className="max-h-80 w-64">
        <SelectGroup>
          <SelectLabel>Syntax highlighting theme</SelectLabel>
          {CODE_THEMES.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function formatRepositorySize(sizeInKb?: number) {
  if (sizeInKb === undefined) return "Unknown";
  if (sizeInKb < 1024) return `${sizeInKb.toLocaleString()} KB`;
  return `${(sizeInKb / 1024).toFixed(1)} MB`;
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
          <div className="w-full space-y-3">
            <div className="space-y-1.5 lg:hidden">
              <p className="text-xs font-medium text-muted-foreground">Syntax theme</p>
              <CodeThemeSelector className="w-full" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-2">
              <span className="pl-2 text-sm">Appearance</span>
              <ThemeToggle className="size-8 text-muted-foreground" />
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type ExplorerWorkspaceProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

function ExplorerWorkspace({ activeTab, setActiveTab }: ExplorerWorkspaceProps) {
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

  const repository = repositoryQuery.data?.repository;
  const selectedFile = selectedItem?.type === "blob" ? selectedItem : null;
  const fileQuery = useQuery({
    queryKey: ["file-content", repository?.fullName, selectedFile?.sha],
    queryFn: ({ signal }) => fetchFileContent(repository!.fullName, selectedFile!.sha, signal),
    enabled: Boolean(repository && selectedFile && activeTab === "content"),
    retry: false,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
  });

  function openRepository(url: string) {
    setSelectedItem(null);
    setFileSearch("");
    setActiveTab("metadata");

    if (url === repoUrl) {
      repositoryQuery.refetch();
    } else {
      setRepoUrl(url);
    }
  }

  function selectTreeItem(item: RepositoryTreeItem) {
    setSelectedItem(item);
    setActiveTab(item.type === "blob" ? "content" : "metadata");
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
  const metadata = repository ? [
    { label: "Repository", value: repository.fullName },
    { label: "Owner", value: repository.owner },
    { label: "Default branch", value: repository.branch },
    { label: "Primary language", value: repository.language ?? "Not detected" },
    { label: "Stars", value: repository.stars.toLocaleString() },
    { label: "Forks", value: repository.forks.toLocaleString() },
    { label: "Watchers", value: (repository.watchers ?? 0).toLocaleString() },
    { label: "Open issues", value: (repository.openIssues ?? 0).toLocaleString() },
    { label: "Visibility", value: repository.visibility ?? "public" },
    { label: "License", value: repository.license ?? "Not specified" },
    { label: "Repository size", value: formatRepositorySize(repository.size) },
    { label: "Created", value: repository.createdAt?.slice(0, 10) ?? "Unknown" },
    { label: "Updated", value: repository.updatedAt?.slice(0, 10) ?? "Unknown" },
    { label: "Last push", value: repository.pushedAt?.slice(0, 10) ?? "Unknown" },
    { label: "Tree entries", value: tree.length.toLocaleString() },
  ] : [];

  return (
    <>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="shrink-0 gap-2 border-b p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileCode2 /></span>
              <span className="truncate font-mono text-sm font-semibold">srcpeek<span className="font-normal text-muted-foreground">.dev</span></span>
            </div>
            <div className="flex shrink-0 items-center">
              <span className="mr-1 h-5 w-px bg-border" />
              <ThemeToggle className="size-8 text-muted-foreground" />
            </div>
          </div>
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
              <RepositoryTree
                items={visibleTree}
                repositoryName={repository.fullName}
                selectedPath={selectedItem?.path ?? null}
                onSelect={selectTreeItem}
              />
              {visibleTree.length === 0 && <p className="px-3 py-8 text-center text-xs text-muted-foreground">No files found</p>}
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="shrink-0 gap-0 border-t bg-background p-0 text-xs text-muted-foreground">
          {repository ? (
            <Collapsible className="group/repository-details" defaultOpen={false}>
              <CollapsibleTrigger className="flex w-full min-w-0 items-center gap-2 p-3 text-left transition-colors hover:bg-accent/50 hover:text-foreground">
                <GitBranch className="size-3.5 shrink-0" />
                <span className="truncate" title={repository.branch}>{repository.branch}</span>
                <span className="ml-auto shrink-0">{tree.length.toLocaleString()} entries</span>
                <ChevronDown className="size-3.5 shrink-0 transition-transform group-data-[state=open]/repository-details:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-top-1">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-t px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-1.5"><Code2 className="size-3.5 shrink-0" /><span className="truncate">{repository.language ?? "Unknown"}</span></span>
                  <span className="flex items-center gap-1.5"><HardDrive className="size-3.5 shrink-0" />{formatRepositorySize(repository.size)}</span>
                  <span className="flex items-center gap-1.5"><Star className="size-3.5 shrink-0" />{repository.stars.toLocaleString()} stars</span>
                  <span className="flex items-center gap-1.5"><GitFork className="size-3.5 shrink-0" />{repository.forks.toLocaleString()} forks</span>
                  <span className="flex items-center gap-1.5"><CircleDot className="size-3.5 shrink-0" />{(repository.openIssues ?? 0).toLocaleString()} issues</span>
                  <span className="truncate capitalize" title={repository.visibility ?? "public"}>{repository.visibility ?? "public"}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="flex items-center gap-2 p-3"><GitBranch className="size-3.5" />No repository open</div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="h-dvh min-h-0 min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-1 border-b px-2 sm:px-3">
          <SidebarTrigger />
          <span className="mx-1 h-5 w-px bg-border" />
          <div className="min-w-0 flex-1 xl:w-56 xl:flex-none" aria-live="polite" aria-busy={repositoryQuery.isFetching}>
            {repositoryQuery.isFetching ? (
              <div className="flex items-center gap-2 px-2" role="status" aria-label="Loading repository">
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3 w-full max-w-32" />
                </div>
              </div>
            ) : repository ? (
              <RepositoryInfo key={repository.fullName} repository={repository} />
            ) : (
              <span className="block truncate px-2 text-sm text-muted-foreground">No repository open</span>
            )}
          </div>
          <span className="mx-1 hidden h-5 w-px shrink-0 bg-border xl:block" />
          <Button
            variant="outline"
            className="hidden min-w-0 flex-1 justify-start text-muted-foreground xl:flex"
            disabled={!repository}
          >
            <Search />
            <span>Search code...</span>
            <span className="ml-auto text-xs opacity-60">⌘ K</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label="Search code"
            disabled={!repository}
          >
            <Search />
          </Button>
          <span className="mx-2 hidden h-6 w-px bg-border lg:block" />
          <CodeThemeSelector className="hidden w-44 shrink-0 lg:flex" />
          <span className="mx-2 hidden h-6 w-px bg-border 2xl:block" />
          <Button variant="secondary" className="hidden 2xl:inline-flex" disabled><Sparkles />Explain with AI</Button>
          <Button onClick={() => setDialogOpen(true)} className="hidden xl:inline-flex"><Plus />Open repository</Button>
          <Button onClick={() => setDialogOpen(true)} variant="ghost" size="icon" className="xl:hidden" aria-label="Open repository"><Plus /></Button>
          <OperationsMenu repository={repository} onOpenRepository={() => setDialogOpen(true)} />
        </header>

        <main className={
          activeTab === "content" && repository
            ? "min-h-0 flex-1 overflow-y-auto"
            : "min-h-0 flex-1 overflow-y-auto p-4 sm:p-8"
        }>
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
            <div className="w-full">
              <TabsContent value="content" className="min-h-full">
                {!selectedFile && (
                  <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-4 text-center">
                    <FileCode2 className="mb-3 size-8 text-muted-foreground" />
                    <h2 className="font-medium">Select a file to preview it</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Choose any text file from the sidebar.</p>
                  </div>
                )}

                {selectedFile && fileQuery.isPending && (
                  <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-96 w-full" /></div>
                )}

                {selectedFile && fileQuery.isError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5">
                    <h2 className="font-medium text-destructive">Could not preview this file</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{fileQuery.error.message}</p>
                  </div>
                )}

                {selectedFile && fileQuery.data && (
                  <FilePreview file={selectedFile} content={fileQuery.data.content} />
                )}
              </TabsContent>

              <TabsContent value="metadata" className="max-w-4xl">
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
  const [activeTab, setActiveTab] = useState("metadata");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-dvh gap-0">
      <SidebarProvider className="h-dvh min-h-0 overflow-hidden bg-background">
        <ExplorerWorkspace activeTab={activeTab} setActiveTab={setActiveTab} />
      </SidebarProvider>
    </Tabs>
  );
}
