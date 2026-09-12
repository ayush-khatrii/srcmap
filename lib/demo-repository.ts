export type RepositoryFile = {
  name: string;
  path: string;
  content: string;
};

// Local sample content for now. GitHub file contents can replace this later.
export const rootFiles: RepositoryFile[] = [
  {
    name: "SKILL.md",
    path: "SKILL.md",
    content: `# Repository Explorer

Explore a repository and understand its code.

## How it works

1. Open a folder in the sidebar.
2. Select a file to read its source.
3. Select another file to update the viewer.

## Scope

This demo supports read-only browsing of sample files.
`,
  },
  {
    name: "README.md",
    path: "README.md",
    content: `# srcpeek

Explore a Repository. Understand Its Code.

srcpeek helps you browse public GitHub repositories without
downloading them or setting up a development environment.

## Planned features

- Browse folders and files
- Search repository code
- Explain files and selections with AI
`,
  },
];

export const folders = [
  {
    name: "app",
    files: [
      {
        name: "page.tsx",
        path: "app/page.tsx",
        content: `"use client";

import { useEffect, useState } from "react";
import { FileCode, FolderGit2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import RepositoryTree from "@/components/repository-tree";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarHeader,
  SidebarInset, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { type RepositoryFile } from "@/lib/demo-repository";

import type { BundledLanguage } from "@/components/kibo-ui/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";

function getLanguage(path: string): BundledLanguage {
  const extension = path.split(".").pop()?.toLowerCase();

  const languages: Record<string, BundledLanguage> = {
    css: "css",
    js: "javascript",
    jsx: "jsx",
    json: "json",
    md: "markdown",
    ts: "typescript",
    tsx: "tsx",
  };

  return languages[extension ?? ""] ?? "text";
}

function SidebarThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="size-8 text-muted-foreground"
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}

function ExplorerWorkspace() {
  // The tree and viewer share this one piece of state.
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const { setOpenMobile } = useSidebar();

  function openFile(file: RepositoryFile) {
    setSelectedFile(file);
    setOpenMobile(false);
  }

  return (
    <>
      <Sidebar collapsible="offcanvas" className="absolute inset-y-0 h-full">
        <SidebarHeader className="h-12 flex-row items-center justify-between border-b px-4">
          <div className="flex justify-between items-center gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <FolderGit2 className="size-4 text-muted-foreground" aria-hidden="true" />
              srcpeek
            </span>
            <SidebarThemeToggle />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <RepositoryTree selectedFile={selectedFile} onSelectFile={openFile} />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0 overflow-hidden" aria-label="File viewer">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b px-3">
          <SidebarTrigger />
          {selectedFile && (
            <div className="flex min-w-0 items-center gap-2 text-sm" aria-live="polite">
              <FileCode className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate" title={selectedFile.path}>{selectedFile.path}</span>
            </div>
          )}
        </div>

        {/* Keep the viewer empty until a file is selected. */}
        {selectedFile && (
          <div className="min-h-0 flex-1 overflow-auto">
            <CodeBlock
              data={[{
                filename: selectedFile.path,
                language: getLanguage(selectedFile.path),
                code: selectedFile.content,
              }]}
              defaultValue={getLanguage(selectedFile.path)}
              className="min-h-full rounded-none border-0"
      >
              <CodeBlockBody>
                {(item) => (
                  <CodeBlockItem key={item.language} value={item.language}>
                    <CodeBlockContent language={item.language as BundledLanguage}
                      themes={{
                        light: "night-owl-light",
                        dark: "night-owl",
                      }}
                    >
                      {item.code}
                    </CodeBlockContent>
                  </CodeBlockItem>
                )}
              </CodeBlockBody>
            </CodeBlock>
          </div>
        )}
      </SidebarInset>
    </>
  );
}

export default function RepositoryExplorer() {
  return (
    <SidebarProvider className="relative h-[calc(100dvh-4rem)] min-h-0 overflow-hidden">
      <ExplorerWorkspace />
    </SidebarProvider>
  );
}

`,
      },
  {
    name: "globals.css",
    path: "app/globals.css",
    content: `@import "tailwindcss";

body {
  margin: 0;
  font-family: sans-serif;
}
`,
  },
] satisfies RepositoryFile[],
  },
];

export const allFiles = [...rootFiles, ...folders.flatMap((folder) => folder.files)];
