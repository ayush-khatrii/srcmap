"use client";

import { SiGithub as Github } from "react-icons/si";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import Header from "@/components/Header";
import { WorkspaceWelcome } from "@/components/workspace-welcome";
import { FileTreeIcon } from "@/lib/file-icons";
import { repositoryUrlParams } from "@/lib/repository-url";
import { ShareRepository } from "@/components/share-repository";
import { AiSidechat } from "@/components/ai-sidechat";
import {
  ArrowRight, ArrowUpRight, Bot, CircleDot, Code2, ExternalLink, FileCode2, FolderGit2, FolderTree, GitBranch, Sparkles, X,
  GitFork, Palette, Plus, Search, Star,
} from "lucide-react";
import { useCodeTheme } from "@/components/code-theme-provider";
import RepositoryTree from "@/components/repository-tree";
import { RepositoryInfo } from "@/components/repository-info";
import { CodeSearch } from "@/components/code-search";
import { SelectionToast } from "@/components/ui/toast";
import { findCodeMatches, type CodeSearchMatch } from "@/lib/code-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader,
  SidebarInset, SidebarProvider, SidebarTrigger, useSidebar,
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
  CodeBlock, CodeBlockBody, CodeBlockContent, CodeBlockItem,
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

function FilePreview({ file, content, searchTerm, matches, activeMatch, onAddLine }: {
  file: RepositoryTreeItem;
  content: string;
  searchTerm: string;
  matches: CodeSearchMatch[];
  activeMatch: number;
  onAddLine: (path: string, code: string, line: number) => void;
}) {
  const language = getLanguage(file.path);
  const code = [{ language, filename: file.path, code: content }];
  const [hoverLine, setHoverLine] = useState<{ line: number; top: number } | null>(null);

  return (
    <div className="relative flex min-h-full flex-1 flex-col" onMouseLeave={() => setHoverLine(null)} onMouseMove={(event) => {
      const target = event.target as HTMLElement;
      const line = target.closest(".line");
      const root = event.currentTarget;
      if (!line || !root.contains(line)) { setHoverLine(null); return; }
      const allLines = root.querySelectorAll(".line");
      const index = Array.from(allLines).indexOf(line);
      const rootRect = root.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      if (index >= 0) setHoverLine({ line: index + 1, top: lineRect.top - rootRect.top });
    }}>
    <CodeBlock
      key={file.sha}
      data={code}
      value={language}
      className="flex !h-auto min-h-full flex-1 !w-full flex-col rounded-none border-0"
    >
      <CodeBlockBody className="flex flex-1 flex-col">
        {(item) => (
          <CodeBlockItem key={item.language} value={item.language} className="flex-1">
            <CodeBlockContent
              searchTerm={searchTerm}
              activeMatch={matches[activeMatch]}
              language={item.language as BundledLanguage}
              className="h-full [&_pre]:min-h-full"
            >
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
    {hoverLine && <Button variant="secondary" className="absolute right-3 z-10 h-7 gap-1.5 rounded-full border px-2.5 text-xs shadow-md" style={{ top: hoverLine.top }} onMouseDown={(event) => event.preventDefault()} onClick={() => {
      const line = content.split("\n")[hoverLine.line - 1] ?? "";
      onAddLine(file.path, line, hoverLine.line);
    }}><Bot className="size-3.5"/>Add to chat</Button>}
    </div>
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
        className={cn("bg-background/50 [&>span]:truncate", className)}
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
      <DialogContent className="gap-0 overflow-hidden p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderGit2 aria-hidden="true" />
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Open a public repository</DialogTitle>
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
          <p className="text-center text-xs text-muted-foreground">No cloning. No downloads. Just code.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type ExplorerWorkspaceProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

function ExplorerWorkspace({ activeTab, setActiveTab }: ExplorerWorkspaceProps) {
  const { open: sidebarOpen, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const { codeBackground, codeForeground } = useCodeTheme();
  const [{ repo: repoUrl, file: filePath, q: codeSearch }, setUrlState] = useQueryStates(
    repositoryUrlParams,
    { history: "replace", shallow: true },
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(Boolean(codeSearch));
  useEffect(() => { if (codeSearch) setSearchOpen(true); }, [codeSearch]);
  useEffect(() => {
    if (!searchOpen) return;
    const frame = requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[aria-label="Search code in selected file (case-sensitive)"]')?.focus());
    return () => cancelAnimationFrame(frame);
  }, [searchOpen, activeTab]);
  const [fileSearch, setFileSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeMatch, setActiveMatch] = useState(0);
  const [selectionToastOpen, setSelectionToastOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setDialogOpen(true);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const [aiAttachments, setAiAttachments] = useState<{ path: string; code: string; startLine?: number; endLine?: number }[]>([]);
  function addAiAttachment(attachment: { path: string; code: string; startLine?: number; endLine?: number }) {
    setAiAttachments((current) => current.some((item) => item.path === attachment.path && item.startLine === attachment.startLine)
      ? current : [...current, attachment]);
    setAiOpen(true);
  }
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);

  const repositoryQuery = useQuery({
    queryKey: ["repository-tree", repoUrl],
    queryFn: () => fetchRepositoryTree(repoUrl),
    enabled: Boolean(repoUrl),
    retry: false,
    staleTime: Infinity,
  });

  const repository = repositoryQuery.data?.repository;
  // The URL stores a path; the fetched tree supplies its SHA and other details.
  const selectedItem = repositoryQuery.data?.tree.find((item) => item.path === filePath) ?? null;
  const selectedFile = selectedItem?.type === "blob" ? selectedItem : null;

  useEffect(() => {
    setFilesLoaded(false);
    if (!repoUrl) { setOpenFiles([]); setFilesLoaded(true); return; }
    try {
      const storageKey = `srcmap:open-files:${repoUrl}`;
      const legacyKey = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        .find((key) => key?.endsWith(`:open-files:${repoUrl}`));
      const saved = localStorage.getItem(storageKey) ?? (legacyKey ? localStorage.getItem(legacyKey) : null);
      setOpenFiles(saved ? JSON.parse(saved).filter((path: unknown) => typeof path === "string") : []);
      if (saved && !localStorage.getItem(storageKey)) localStorage.setItem(storageKey, saved);
      if (legacyKey && legacyKey !== storageKey) localStorage.removeItem(legacyKey);
    } catch { setOpenFiles([]); }
    setFilesLoaded(true);
  }, [repoUrl]);

  useEffect(() => {
    if (!filesLoaded || !repoUrl || !selectedFile) return;
    setOpenFiles((current) => current.includes(selectedFile.path) ? current : [...current, selectedFile.path]);
  }, [selectedFile?.path, filesLoaded, repoUrl]);

  useEffect(() => {
    if (filesLoaded && repoUrl) localStorage.setItem(`srcmap:open-files:${repoUrl}`, JSON.stringify(openFiles));
  }, [openFiles, filesLoaded, repoUrl]);

  useEffect(() => {
    setActiveTab(selectedItem?.type === "blob" ? "content" : "metadata");
    setActiveMatch(0);
  }, [repoUrl, filePath, selectedItem?.type, setActiveTab]);

  useEffect(() => {
    setFileSearch("");
  }, [repoUrl]);
  const fileQuery = useQuery({
    queryKey: ["file-content", repository?.fullName, selectedFile?.sha],
    queryFn: ({ signal }) => fetchFileContent(repository!.fullName, selectedFile!.sha, signal),
    enabled: Boolean(repository && selectedFile && activeTab === "content"),
    retry: false,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
  });
  const contextFiles = ["README.md", "package.json"].map((name) =>
    repositoryQuery.data?.tree.find((item) => item.type === "blob" && item.path.toLowerCase() === name.toLowerCase()),
  );
  const contextQueries = useQueries({ queries: contextFiles.map((item) => ({
    queryKey: ["ai-context-file", repository?.fullName, item?.sha],
    queryFn: ({ signal }: { signal: AbortSignal }) => fetchFileContent(repository!.fullName, item!.sha, signal),
    enabled: Boolean(repository && item), retry: false, staleTime: Infinity,
  })) });
  const aiRepositoryContext = repository ? {
    fullName: repository.fullName, url: repository.url, description: repository.description,
    readme: contextQueries[0]?.data?.content,
    packageJson: contextQueries[1]?.data?.content,
  } : undefined;

  // Wait for a short pause in typing before scanning and highlighting the file.
  useEffect(() => {
    setActiveMatch(0);
    const timer = setTimeout(() => setDebouncedSearch(codeSearch), 300);
    return () => clearTimeout(timer);
  }, [codeSearch]);

  // Count each word occurrence locally. No extra API requests.
  const matches = useMemo(
    () => findCodeMatches(fileQuery.data?.content ?? "", debouncedSearch),
    [fileQuery.data?.content, debouncedSearch],
  );

  function updateCodeSearch(value: string) {
    void setUrlState({ q: value });
    if (!value) setDebouncedSearch("");
    setActiveMatch(0);
  }

  function openCodeSearch() {
    if (!selectedFile) { setSelectionToastOpen(true); return; }
    setActiveTab("content");
    setSearchOpen(true);
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[aria-label="Search code in selected file (case-sensitive)"]')?.focus());
  }

  useEffect(() => {
    function handleFind(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f" && selectedFile) {
        event.preventDefault();
        setActiveTab("content");
        setSearchOpen(true);
        requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[aria-label="Search code in selected file (case-sensitive)"]')?.focus());
      }
    }
    window.addEventListener("keydown", handleFind);
    return () => window.removeEventListener("keydown", handleFind);
  }, [selectedFile, setActiveTab]);

  function focusCodeSearch() {
    if (!selectedFile) {
      setSelectionToastOpen(true);
      return;
    }
    setActiveTab("content");
  }

  function navigateMatch(direction: number) {
    if (!matches.length || codeSearch !== debouncedSearch) return;
    setActiveTab("content");
    setActiveMatch((current) => (current + direction + matches.length) % matches.length);
  }

  function openRepository(url: string) {
    // Clear the previous file and search together when opening another repo.
    void setUrlState({ repo: url, file: "", q: "" }, { history: "push" });
    setDebouncedSearch("");
    setActiveMatch(0);
    setFileSearch("");
    setActiveTab("metadata");

    if (url === repoUrl) {
      repositoryQuery.refetch();
    }
  }

  function selectTreeItem(item: RepositoryTreeItem) {
    if (isMobile && item.type === "blob") setOpenMobile(false);
    void setUrlState({ file: item.path, q: "" }, { history: "push" });
    setDebouncedSearch("");
    setActiveMatch(0);
    setSelectionToastOpen(false);
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
      <Header aiOpen={aiOpen} onToggleAi={() => setAiOpen((value) => !value)}
        fileContent={selectedFile ? fileQuery.data?.content : undefined} hasFile={Boolean(selectedFile)} canShare={Boolean(repository)}
        onShare={() => setShareOpen(true)} onSearch={openCodeSearch} />
      <ShareRepository repo={repository?.url ?? repoUrl} file={filePath} search={codeSearch} disabled={!repository} open={shareOpen} onOpenChange={setShareOpen} hideTrigger />

      <Sidebar collapsible="offcanvas" className="top-14 bottom-0 h-auto">
        <SidebarHeader className="shrink-0 gap-4 border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">Explorer</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Open repository" title="Open repository (Ctrl/⌘ K)" onClick={() => { if (isMobile) setOpenMobile(false); setDialogOpen(true); }}><Plus className="size-3.5" /></Button>
              <SidebarTrigger aria-label="Close file explorer" title="Close file explorer" className="size-7 text-muted-foreground" />
            </div>
          </div>
          {repository ? <div className="flex min-w-0 items-center gap-1"><div className="min-w-0 flex-1"><RepositoryInfo key={repository.fullName} repository={repository} /></div><Button asChild variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground"><a href={repository.url} target="_blank" rel="noreferrer" aria-label="View repository on GitHub" title="View on GitHub"><ExternalLink className="size-3.5" /></a></Button></div> : <div className="flex items-center gap-2.5 rounded-lg border border-dashed p-3"><FolderGit2 className="size-4 text-primary" /><span className="text-xs text-muted-foreground">Open a repository</span></div>}
          {repository && <TabsList aria-label="Repository view" className="h-8 w-full bg-muted">
            <TabsTrigger value="content" className="px-3 text-xs" onClick={() => { if (isMobile) setOpenMobile(false); }}>Content</TabsTrigger>
            <TabsTrigger value="metadata" className="px-3 text-xs" onClick={() => { if (isMobile) setOpenMobile(false); }}>Metadata</TabsTrigger>
          </TabsList>}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input id="file-filter" aria-label="Find a file" value={fileSearch} onChange={(event) => setFileSearch(event.target.value)} placeholder="Find a file…" className="h-8 rounded-md bg-background/50 pl-8 text-xs shadow-none" disabled={!repository} />
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-0">
          {repositoryQuery.isFetching && repoUrl && <TreeSkeleton />}
          {!repoUrl && <div className="flex flex-1 flex-col items-center px-5 pt-12 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl border bg-background/40"><FolderTree className="size-5 text-muted-foreground" strokeWidth={1.5} /></div>
            <p className="text-xs font-medium">No repository open</p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Open a repository and its files<br />will appear right here.</p>
          </div>}
          {repositoryQuery.isError && <div role="alert" className="m-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs leading-5 text-destructive">{repositoryQuery.error.message}</div>}
          {repository && !repositoryQuery.isFetching && <SidebarGroup className="shrink-0 p-2 pt-0 pb-3">
            <RepositoryTree items={visibleTree} repositoryName={repository.name} selectedPath={selectedItem?.path ?? null} onSelect={selectTreeItem} />
            {visibleTree.length === 0 && <p className="px-3 py-8 text-center text-xs text-muted-foreground">No files match “{fileSearch}”.</p>}
          </SidebarGroup>}
        </SidebarContent>
        <SidebarFooter className="shrink-0 gap-2 border-t px-4 py-3">
          <CodeThemeSelector className="h-8 w-full min-w-0 text-xs" />
          <div className="flex min-w-0 items-center gap-2 text-[10px] text-muted-foreground">
            <GitBranch className="size-3 shrink-0" />
            <span className="min-w-0 truncate">{repository?.branch ?? "No branch selected"}</span>
            {repository && <span className="shrink-0">{tree.filter((item) => item.type === "blob").length.toLocaleString()} files</span>}
            <ThemeToggle className="ml-auto size-8 shrink-0 text-muted-foreground hover:text-foreground" />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="relative h-full min-h-0 min-w-0 overflow-hidden bg-background">
        {(isMobile || !sidebarOpen) && !(repository && activeTab === "content") && <div className="flex h-10 shrink-0 items-center px-2">
          <SidebarTrigger aria-label="Open file explorer" title="Open file explorer" className="size-8 text-muted-foreground" />
        </div>}
        {repository && activeTab === "content" && <div className="flex h-10 min-w-0 shrink-0 border-b bg-chrome">
          {(isMobile || !sidebarOpen) && <div className="flex shrink-0 items-center border-r px-1"><SidebarTrigger aria-label="Open file explorer" title="Open file explorer" className="size-8 text-muted-foreground" /></div>}
          <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto" aria-label="Open files">
          {openFiles.map((path) => {
            const item = tree.find((entry) => entry.path === path && entry.type === "blob");
            if (!item) return null;
            const active = path === selectedFile?.path;
            return <div key={path} className={cn("group flex max-w-60 shrink-0 items-center gap-1 border-r border-t-2 pr-1 text-muted-foreground", active ? "border-t-primary bg-background text-foreground" : "border-t-transparent")}>
              <button type="button" aria-current={active ? "page" : undefined} title={path} onClick={() => selectTreeItem(item)} className="flex min-w-0 items-center gap-2 self-stretch px-3 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><FileTreeIcon path={path} isFolder={false} /><span className="truncate">{path.split("/").pop()}</span></button>
              {active && <Button variant="ghost" size="icon" title="Add file to AI chat" aria-label="Add active file to AI chat" disabled={!fileQuery.data} onClick={() => addAiAttachment({ path, code: fileQuery.data?.content ?? "" })} className="size-6 text-muted-foreground"><Sparkles className="size-3" /></Button>}
              <Button variant="ghost" size="icon" aria-label={`Close ${path}`} onClick={() => {
                const next = openFiles.filter((entry) => entry !== path);
                setOpenFiles(next);
                if (active) {
                  const replacement = next.map((entry) => tree.find((candidate) => candidate.path === entry && candidate.type === "blob")).find(Boolean);
                  if (replacement) selectTreeItem(replacement);
                  else void setUrlState({ file: "", q: "" }, { history: "push" });
                }
              }} className="size-6 text-muted-foreground"><X className="size-3" /></Button>
            </div>;
          })}
          </div>
        </div>}
        {repository && activeTab === "content" && searchOpen && <div id="file-search-panel" className="flex shrink-0 items-center gap-1 border-b bg-chrome px-2 py-1.5" onKeyDown={(event) => { if (event.key === "Escape") { setSearchOpen(false); updateCodeSearch(""); requestAnimationFrame(() => document.getElementById("workspace-actions-trigger")?.focus()); } }}>
          <CodeSearch value={codeSearch} onChange={updateCodeSearch} onFocus={focusCodeSearch}
            searching={codeSearch !== debouncedSearch} hasFile={Boolean(selectedFile)} loading={fileQuery.isPending} failed={fileQuery.isError}
            matchCount={matches.length} activeMatch={activeMatch} onNavigate={navigateMatch} className="h-8 min-w-0 flex-1" />
          <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" aria-label="Close file search" onClick={() => { setSearchOpen(false); updateCodeSearch(""); }}><X className="size-3.5" /></Button>
        </div>}

        <main id="workspace-content" className="min-h-0 min-w-0 flex-1 overflow-auto" style={repository && activeTab === "content" && selectedFile ? { backgroundColor: codeBackground, color: codeForeground } : undefined}>
          {!repoUrl && <WorkspaceWelcome onOpenRepository={() => setDialogOpen(true)} />}
          {repositoryQuery.isFetching && repoUrl && <div role="status" aria-label="Loading repository" className="space-y-5 p-6 sm:p-10"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-2/3" /><Skeleton className="h-24 w-full" /><div className="grid grid-cols-2 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>}
          {repositoryQuery.isError && <div role="alert" className="m-5 rounded-xl border border-destructive/30 bg-destructive/5 p-6 sm:m-10"><FolderGit2 className="mb-4 size-6 text-destructive" /><h1 className="font-semibold">We couldn’t open that repository</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{repositoryQuery.error.message}</p><Button className="mt-5" onClick={() => setDialogOpen(true)}>Try another URL<ArrowRight className="size-4" /></Button></div>}
          {repository && !repositoryQuery.isFetching && <div className="flex min-h-full w-full flex-col">
            {filePath && !selectedItem && <p role="status" className="break-words border-b bg-card p-4 text-sm text-muted-foreground">The shared file “{filePath}” is not in this repository’s current tree. Choose a file from the explorer.</p>}
            <TabsContent value="content" className="flex min-h-full flex-1 flex-col">
              {!selectedFile && <div className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center"><div className="mb-5 rounded-2xl border bg-card p-5"><FileCode2 className="size-8 text-primary" strokeWidth={1.5} /></div><h2 className="text-lg font-semibold tracking-tight">Select a file to preview it</h2><p className="mt-2 text-sm text-muted-foreground">Choose a file from the explorer to start reading.</p><Button variant="outline" onClick={toggleSidebar} className="mt-5 md:hidden"><FolderTree />Open file explorer</Button></div>}
              {selectedFile && fileQuery.isPending && <div role="status" aria-label="Loading file" className="space-y-4 p-5"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /></div>}
              {selectedFile && fileQuery.isError && <div role="alert" className="m-5 rounded-xl border border-destructive/30 bg-background p-5 text-foreground"><h2 className="font-medium text-destructive">Could not preview this file</h2><p className="mt-2 text-sm text-muted-foreground">{fileQuery.error.message}</p><Button variant="outline" className="mt-4" onClick={() => fileQuery.refetch()}>Try again</Button></div>}
              {selectedFile && fileQuery.data && <FilePreview file={selectedFile} content={fileQuery.data.content} searchTerm={debouncedSearch} matches={matches} activeMatch={activeMatch} onAddLine={(path, code, line) => addAiAttachment({ path, code, startLine: line })} />}
            </TabsContent>
            <TabsContent value="metadata" className="mx-auto w-full max-w-5xl p-5 sm:p-8 2xl:p-10">
              <div className="mb-6 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-primary"><span className="size-1.5 rounded-full bg-primary" />Public repository</div>
              <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="mb-1 text-sm text-muted-foreground">{repository.owner} /</p><h1 className="break-words text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{repository.name}</h1></div><div className="flex shrink-0 items-center gap-2"><Button asChild variant="outline" className="h-8 gap-2 text-xs"><a href={repository.url} target="_blank" rel="noreferrer"><Github className="size-3.5" />GitHub<ArrowUpRight className="size-3.5" /></a></Button></div></div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{repository.description ?? "Explore the source and see how this project comes together."}</p>
              <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
                {[{ label: "Stars", value: repository.stars, icon: Star }, { label: "Forks", value: repository.forks, icon: GitFork }, { label: "Open issues", value: repository.openIssues ?? 0, icon: CircleDot }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border bg-card p-3 sm:p-4"><Icon className="mb-3 size-4 text-primary" /><p className="text-xl font-semibold tracking-tight sm:text-2xl">{value.toLocaleString()}</p><p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">{label}</p></div>)}
              </div>
              <h2 className="mb-3 mt-8 text-sm font-semibold">Repository details</h2>
              <dl className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2">{metadata.filter((item) => !["Stars", "Forks", "Open issues"].includes(item.label)).map((item) => <div key={item.label} className="min-w-0 border-b border-border/60 px-4 py-3 last:border-b-0"><dt className="text-[10px] text-muted-foreground">{item.label}</dt><dd className="mt-1 truncate text-xs font-medium" title={item.value}>{item.value}</dd></div>)}</dl>
              {selectedItem && <div className="mt-5 rounded-xl border bg-card p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Selected {selectedItem.type === "blob" ? "file" : "folder"}</p><h2 className="mt-2 break-all font-mono text-xs">{selectedItem.path}</h2><p className="mt-2 font-mono text-[10px] text-muted-foreground">{selectedItem.sha.slice(0, 12)}{selectedItem.size !== undefined && ` · ${selectedItem.size.toLocaleString()} bytes`}</p></div>}
            </TabsContent>
          </div>}
        </main>
      </SidebarInset>

      <AiSidechat open={aiOpen} onOpenChange={setAiOpen} repository={aiRepositoryContext} snippet={fileQuery.data?.content}
        attachments={aiAttachments} onRemoveAttachment={(path) => setAiAttachments((items) => items.filter((item) => item.path !== path))}
        onOpenFile={(path) => { const target = tree.find((item) => item.path === path); if (target) { selectTreeItem(target); if (!window.matchMedia("(min-width: 1280px)").matches) setAiOpen(false); } }} />
      <OpenRepositoryDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={openRepository} />
      <SelectionToast open={selectionToastOpen} onOpenChange={setSelectionToastOpen} />
    </>
  );
}

export default function RepositoryExplorer() {
  const [activeTab, setActiveTab] = useState("metadata");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-dvh gap-0">
      <SidebarProvider className="relative h-dvh min-h-0 overflow-hidden bg-background pt-14" style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
        <ExplorerWorkspace activeTab={activeTab} setActiveTab={setActiveTab} />
      </SidebarProvider>
    </Tabs>
  );
}
