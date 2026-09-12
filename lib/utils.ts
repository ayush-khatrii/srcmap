export { cn } from "cn"

export function parseGitHubUrl(repoUrl: string) {
  const url = new URL(repoUrl);
  const [owner, repositoryName] = url.pathname.split("/").filter(Boolean);

  if (url.hostname !== "github.com" || !owner || !repositoryName) {
    throw new Error("Enter a valid GitHub repository URL.");
  }

  return {
    owner,
    repo: repositoryName.replace(/\.git$/, ""),
  };
}
