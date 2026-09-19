import RepositoryExplorer from "@/components/repository-explorer";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div role="status" className="p-4 text-sm text-muted-foreground">Loading explorer…</div>}>
      <RepositoryExplorer />
    </Suspense>
  );
}
