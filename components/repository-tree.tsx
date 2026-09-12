"use client";

import {
  TreeCollapseAll, TreeExpander, TreeIcon, TreeLabel, TreeNode,
  TreeNodeContent, TreeNodeTrigger, TreeProvider, TreeView,
} from "@/components/kibo-ui/tree";
import { ChevronsUp, FolderGit2 } from "lucide-react";
import type { RepositoryTreeItem } from "@/lib/github-types";
import { FileTreeIcon } from "@/lib/file-icons";

type RepositoryTreeProps = {
  items: RepositoryTreeItem[];
  repositoryName: string;
  selectedPath: string | null;
  onSelect: (item: RepositoryTreeItem) => void;
};

type TreeItemsProps = {
  items: RepositoryTreeItem[];
  parentPath?: string;
  level?: number;
};

function TreeItems({ items, parentPath = "", level = 0 }: TreeItemsProps) {
  const directChildren = items.filter((item) => {
    if (parentPath && !item.path.startsWith(`${parentPath}/`)) {
      return false;
    }

    const relativePath = parentPath
      ? item.path.slice(parentPath.length + 1)
      : item.path;

    return !relativePath.includes("/");
  });

  return directChildren.map((item) => {
    const isFolder = item.type === "tree";

    return (
      <TreeNode key={item.sha + item.path} nodeId={item.path} level={level}>
        <TreeNodeTrigger title={item.path}>
          <TreeExpander hasChildren={isFolder} />
          <TreeIcon
            hasChildren={isFolder}
            icon={<FileTreeIcon path={item.path} isFolder={isFolder} />}
            openIcon={isFolder ? <FileTreeIcon path={item.path} isFolder isOpen /> : undefined}
          />
          <TreeLabel>{item.path.split("/").pop()}</TreeLabel>
        </TreeNodeTrigger>

        <TreeNodeContent hasChildren={isFolder}>
          <TreeItems items={items} parentPath={item.path} level={level + 1} />
        </TreeNodeContent>
      </TreeNode>
    );
  });
}

export default function RepositoryTree({
  items,
  repositoryName,
  selectedPath,
  onSelect,
}: RepositoryTreeProps) {
  function handleSelection(selectedIds: string[]) {
    const item = items.find((item) => item.path === selectedIds[0]);
    if (item) onSelect(item);
  }

  return (
    <TreeProvider
      selectedIds={selectedPath ? [selectedPath] : []}
      onSelectionChange={handleSelection}
    >
      <div className="flex h-8 min-w-0 items-center gap-2 px-2 pb-1 text-xs font-medium text-muted-foreground">
        <FolderGit2 className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate" title={repositoryName}>
          {repositoryName}
        </span>
        <TreeCollapseAll
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label="Collapse all folders"
          title="Collapse every open folder"
        >
          <ChevronsUp className="size-3.5" />
          <span className="sr-only">Collapse all folders</span>
        </TreeCollapseAll>
      </div>
      <TreeView className="p-0" aria-label="Repository files">
        <TreeItems items={items} />
      </TreeView>
    </TreeProvider>
  );
}
