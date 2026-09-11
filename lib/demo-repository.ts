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
        content: `import RepositoryExplorer from "@/components/repository-explorer";

export default function Home() {
  return <RepositoryExplorer />;
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
