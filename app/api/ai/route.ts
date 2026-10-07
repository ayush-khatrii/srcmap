import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI is not configured. Set DEEPSEEK_API_KEY on the server." }, { status: 503 });

  try {
    const { messages = [], snippet = "", repository, attachments = [] } = await request.json();
    const context = [
      repository?.fullName ? `Repository: ${repository.fullName}` : "",
      repository?.url ? `GitHub: ${repository.url}` : "",
      repository?.description ? `Description: ${repository.description}` : "",
      repository?.readme ? `README.md:\n${repository.readme.slice(0, 12000)}` : "",
      repository?.packageJson ? `package.json:\n${repository.packageJson.slice(0, 8000)}` : "",
      ...attachments.map((attachment: { path?: string; startLine?: number }) => attachment.path ? `Attached file: ${attachment.path}${attachment.startLine ? ` (line ${attachment.startLine})` : ""}` : ""),
      snippet ? `Current code snippet:\n\`\`\`\n${snippet.slice(0, 30000)}\n\`\`\`` : "",
    ].filter(Boolean).join("\n\n");
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: `You explain code clearly and concisely. Use repository context when relevant.\n\n${context}` },
          ...messages,
        ],
        stream: false,
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) return NextResponse.json({ error: data.error?.message || "DeepSeek request failed." }, { status: upstream.status });
    return NextResponse.json({ answer: data.choices?.[0]?.message?.content || "No response received." });
  } catch {
    return NextResponse.json({ error: "Could not process the AI request." }, { status: 400 });
  }
}
