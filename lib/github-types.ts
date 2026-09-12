export type RepositoryTreeItem = {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
};

export type RepositoryTreeResponse = {
  repository: {
    name: string;
    fullName: string;
    description: string | null;
    branch: string;
    language: string | null;
    stars: number;
    forks: number;
    url: string;
  };
  tree: RepositoryTreeItem[];
};
