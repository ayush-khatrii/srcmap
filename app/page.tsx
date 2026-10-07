import RepositoryExplorer from "@/components/repository-explorer";
import { Suspense } from "react";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Srcmap",
        url: "https://srcmap.cc",
        description: "Explore GitHub repositories online without cloning.",
      },
      {
        "@type": "WebApplication",
        name: "Srcmap",
        url: "https://srcmap.cc",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser",
        description: "A VS Code-like online workspace to explore GitHub repositories, browse file trees, view source code online, and search code without cloning.",
        featureList: [
          "Explore public GitHub repositories without cloning",
          "Browse a VS Code-style repository tree in the browser",
          "View syntax-highlighted source code online",
          "Search inside repository files",
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Suspense fallback={<div role="status" className="p-4 text-sm text-muted-foreground">Loading Srcmap repository explorer…</div>}>
        <RepositoryExplorer />
      </Suspense>
    </>
  );
}
