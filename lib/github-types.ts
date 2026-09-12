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
    watchers: number;
    openIssues: number;
    size: number;
    visibility: string;
    license: string | null;
    owner: string;
    ownerUrl?: string;
    ownerAvatarUrl?: string;
    ownerType?: string;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    url: string;
  };
  tree: RepositoryTreeItem[];
};

export type RepositoryFileResponse = {
  content: string;
  sha: string;
  size: number;
};
