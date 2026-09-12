import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 1_000_000;

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const repo = searchParams.get("repo");
    const sha = searchParams.get("sha");

    if (!repo || !sha) {
      return NextResponse.json(
        { error: "Repository and file SHA are required." },
        { status: 400 },
      );
    }

    if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !/^[a-f0-9]{40}$/i.test(sha)) {
      return NextResponse.json({ error: "Invalid repository or file SHA." }, { status: 400 });
    }

    const githubResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/blobs/${sha}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        cache: "force-cache",
      },
    );

    if (!githubResponse.ok) {
      return NextResponse.json(
        { error: "File content could not be loaded from GitHub." },
        { status: githubResponse.status === 404 ? 404 : 502 },
      );
    }

    const blob = await githubResponse.json();

    if (blob.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "This file is larger than the 1 MB preview limit." },
        { status: 413 },
      );
    }

    if (blob.encoding !== "base64" || typeof blob.content !== "string") {
      return NextResponse.json({ error: "This file cannot be previewed." }, { status: 415 });
    }

    const fileBuffer = Buffer.from(blob.content.replace(/\n/g, ""), "base64");

    if (fileBuffer.includes(0)) {
      return NextResponse.json(
        { error: "Binary files cannot be previewed yet." },
        { status: 415 },
      );
    }

    return NextResponse.json(
      { content: fileBuffer.toString("utf8"), sha: blob.sha, size: blob.size },
      { headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "File content could not be loaded.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
