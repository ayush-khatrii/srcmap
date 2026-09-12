import { NextResponse } from "next/server";
import type { RepositoryTreeItem } from "@/lib/github-types";
import { parseGitHubUrl } from "@/lib/utils";

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2026-03-10",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

export async function GET(request: Request) {
  try {
    const repoUrl = new URL(request.url).searchParams.get("url");

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required." }, { status: 400 });
    }

    const { owner, repo } = parseGitHubUrl(repoUrl);
    const repositoryResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: githubHeaders,
      cache: "no-store",
    });

    if (!repositoryResponse.ok) {
      return NextResponse.json({ error: "Public repository not found." }, { status: 404 });
    }

    const repository = await repositoryResponse.json();

    if (repository.private) {
      return NextResponse.json({ error: "Only public repositories are supported." }, { status: 400 });
    }

    const branch = repository.default_branch;
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      { headers: githubHeaders, cache: "no-store" },
    );

    if (!treeResponse.ok) {
      return NextResponse.json({ error: "Repository tree could not be loaded." }, { status: 502 });
    }

    const treeData = await treeResponse.json();
    const tree: RepositoryTreeItem[] = treeData.tree
      .filter((item: RepositoryTreeItem) => item.type === "blob" || item.type === "tree")
      .map((item: RepositoryTreeItem) => ({
        path: item.path,
        type: item.type,
        sha: item.sha,
        size: item.size,
      }));

    return NextResponse.json({
      repository: {
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        branch,
        language: repository.language,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        watchers: repository.subscribers_count,
        openIssues: repository.open_issues_count,
        size: repository.size,
        visibility: repository.visibility,
        license: repository.license?.spdx_id ?? null,
        owner: repository.owner.login,
        createdAt: repository.created_at,
        updatedAt: repository.updated_at,
        pushedAt: repository.pushed_at,
        url: repository.html_url,
      },
      tree,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Repository could not be loaded.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
