"use client";

import { useState } from "react";
import { FileCode, FolderGit2 } from "lucide-react";
import RepositoryTree from "@/components/repository-tree";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarHeader,
  SidebarInset, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { type RepositoryFile } from "@/lib/demo-repository";

import type { BundledLanguage } from "@/components/kibo-ui/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";

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
          <span className="flex items-center gap-2 text-sm font-medium">
            <FolderGit2 className="size-4 text-muted-foreground" aria-hidden="true" />
            srcpeek
          </span>
          <span className="text-xs text-muted-foreground">Sample files</span>
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
          <pre className="min-h-0 flex-1 overflow-auto p-5 font-mono text-sm leading-7" tabIndex={0} aria-label={`Contents of ${selectedFile.path}`}>
            <code>{selectedFile.content}</code>
          </pre>
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
