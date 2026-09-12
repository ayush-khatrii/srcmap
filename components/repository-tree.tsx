"use client";

import {
  TreeExpander, TreeIcon, TreeLabel, TreeNode, TreeNodeContent,
  TreeNodeTrigger, TreeProvider, TreeView,
} from "@/components/kibo-ui/tree";
import type { RepositoryTreeItem } from "@/lib/github-types";

type RepositoryTreeProps = {
  items: RepositoryTreeItem[];
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
          <TreeIcon hasChildren={isFolder} />
          <TreeLabel>{item.path.split("/").pop()}</TreeLabel>
        </TreeNodeTrigger>

        <TreeNodeContent hasChildren={isFolder}>
          <TreeItems items={items} parentPath={item.path} level={level + 1} />
        </TreeNodeContent>
      </TreeNode>
    );
  });
}

export default function RepositoryTree({ items, selectedPath, onSelect }: RepositoryTreeProps) {
  function handleSelection(selectedIds: string[]) {
    const item = items.find((item) => item.path === selectedIds[0]);
    if (item) onSelect(item);
  }

  return (
    <TreeProvider
      selectedIds={selectedPath ? [selectedPath] : []}
      onSelectionChange={handleSelection}
    >
      <TreeView className="p-0" aria-label="Repository files">
        <TreeItems items={items} />
      </TreeView>
    </TreeProvider>
  );
}
