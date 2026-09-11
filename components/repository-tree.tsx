"use client";

import {
  TreeExpander, TreeIcon, TreeLabel, TreeNode, TreeNodeContent,
  TreeNodeTrigger, TreeProvider, TreeView,
} from "@/components/kibo-ui/tree";
import { allFiles, folders, rootFiles, type RepositoryFile } from "@/lib/demo-repository";

type RepositoryTreeProps = {
  selectedFile: RepositoryFile | null;
  onSelectFile: (file: RepositoryFile) => void;
};

function FileItem({ file, level = 0 }: { file: RepositoryFile; level?: number }) {
  return (
    <TreeNode nodeId={file.path} level={level}>
      <TreeNodeTrigger title={file.path}>
        <TreeExpander />
        <TreeIcon />
        <TreeLabel>{file.name}</TreeLabel>
      </TreeNodeTrigger>
    </TreeNode>
  );
}

export default function RepositoryTree({ selectedFile, onSelectFile }: RepositoryTreeProps) {
  function handleSelection(selectedIds: string[]) {
    // Clicking the open file again should keep it open.
    const path = selectedIds[0] ?? selectedFile?.path;
    const file = allFiles.find((file) => file.path === path);

    // Folders only expand/collapse; they do not replace the open file.
    if (file) onSelectFile(file);
  }

  return (
    <TreeProvider
      defaultExpandedIds={["folder:app"]}
      selectedIds={selectedFile ? [selectedFile.path] : []}
      onSelectionChange={handleSelection}
      animateExpand={false}
    >
      <TreeView className="p-0" aria-label="Repository files">
        {folders.map((folder) => (
          <TreeNode key={folder.name} nodeId={`folder:${folder.name}`}>
            <TreeNodeTrigger>
              <TreeExpander hasChildren />
              <TreeIcon hasChildren />
              <TreeLabel>{folder.name}</TreeLabel>
            </TreeNodeTrigger>
            <TreeNodeContent hasChildren>
              {folder.files.map((file) => <FileItem key={file.path} file={file} level={1} />)}
            </TreeNodeContent>
          </TreeNode>
        ))}
        {rootFiles.map((file) => <FileItem key={file.path} file={file} />)}
      </TreeView>
    </TreeProvider>
  );
}
