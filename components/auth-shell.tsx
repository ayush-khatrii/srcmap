import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, FolderTree, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({ children }: { children: ReactNode }) {
  return <main className="flex h-dvh overflow-y-auto bg-background">
    <div className="hidden min-h-full w-5/12 flex-col justify-between border-r bg-sidebar p-10 lg:flex xl:p-16">
      <Link href="/" className="flex w-fit items-center gap-3"><Image src="/logo.svg" alt="" width={36} height={36} className="size-9 rounded-md" /><span className="text-xl font-semibold tracking-tight">srcmap<span className="text-primary">.</span></span></Link>
      <div className="py-12"><p className="mb-5 font-mono text-xs tracking-widest text-primary">BUILT FOR THE CURIOUS</p><h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Great code.<br />A little closer.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Your space to explore repositories, understand unfamiliar code, and connect the dots.</p><div className="mt-10 space-y-5 text-sm text-muted-foreground"><p className="flex items-center gap-3"><FolderTree className="size-4 text-primary" />The whole repository, without the clone.</p><p className="flex items-center gap-3"><Sparkles className="size-4 text-primary" />An AI companion for your next deep dive.</p></div></div>
      <p className="text-xs text-muted-foreground">Less setup. More understanding.</p>
    </div>
    <div className="flex min-h-full min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between p-5 sm:p-8"><Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Back to workspace</Link><ThemeToggle /></header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">{children}</div>
      <p className="p-6 text-center text-xs text-muted-foreground">Your next discovery starts here.</p>
    </div>
  </main>;
}
