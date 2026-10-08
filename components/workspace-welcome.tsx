"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function WorkspaceWelcome({ onOpenRepository }: { onOpenRepository: () => void }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
      <Image src="/logo.svg" alt="" width={56} height={56} className="mb-6 size-14 rounded-xl" />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Explore GitHub repositories<br className="hidden sm:block" /> without cloning.</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Open a public repository to browse its files, search code, and ask AI about what you’re reading.</p>
      <Button className="mt-6" onClick={onOpenRepository}><Plus />Open repository</Button>
    </div>
  );
}
