"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Bookmark, ChevronDown, CodeXml, CreditCard, FolderSearch,
  History, LogIn, LogOut, Menu, MessageSquare, Settings, Sparkles, UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type HeaderUser = {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: string;
};

type HeaderProps = {
  navigation?: ReadonlyArray<{ label: string; href: string }>;
  user?: HeaderUser | null;
  onSignOut?: () => void;
};

const defaultNavigation = [
  { label: "Explore", href: "/" },
  { label: "Saved repositories", href: "/saved" },
  { label: "AI chats", href: "/chats" },
];

// Sample account for the UI showcase; pass the authenticated user when available.
const demoUser: HeaderUser = {
  name: "Alex Morgan",
  email: "alex@example.com",
  plan: "Free plan",
};

const workspaceItems = [
  { label: "Explore repositories", href: "/", icon: FolderSearch },
  { label: "Recently viewed", href: "/recent", icon: History },
  { label: "Saved repositories", href: "/saved", icon: Bookmark },
  { label: "AI chats", href: "/chats", icon: MessageSquare },
];

const Header = ({ navigation = defaultNavigation, user = demoUser, onSignOut }: HeaderProps) => {
  const pathname = usePathname();
  const [demoSignedOut, setDemoSignedOut] = useState(false);
  const currentUser = user === demoUser && demoSignedOut ? null : user;
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 text-foreground backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-full items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">

        <Link href="/" aria-label="srcpeek home" className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <CodeXml className="hidden size-6 text-primary sm:block" aria-hidden="true" />
          <span className="font-mono text-lg font-semibold tracking-tight">
            srcpeek<span className="font-normal text-muted-foreground">.sh</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="ml-4 hidden items-center gap-1 lg:flex">
          {navigation.map(({ label, href }) => (
            <Button key={href} asChild variant="ghost" className={isActive(href) ? "bg-accent text-accent-foreground" : "text-muted-foreground"}>
              <Link href={href} aria-current={isActive(href) ? "page" : undefined}>{label}</Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button asChild className="mr-1 hidden sm:inline-flex">
            <Link href="/pricing"><Sparkles aria-hidden="true" />Upgrade</Link>
          </Button>
          <ThemeToggle className="text-muted-foreground" />

          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 rounded-full p-0.5 sm:pr-2" aria-label={`Open account menu for ${currentUser.name}`}>
                  <Avatar className="size-8 border border-border">
                    <AvatarImage src={currentUser.avatarUrl} alt="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden text-muted-foreground sm:block" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
                <DropdownMenuLabel className="space-y-1 py-3">
                  <p className="truncate text-sm font-semibold text-foreground">{currentUser.name}</p>
                  <p className="truncate font-normal">{currentUser.email}</p>
                  <span className="mt-2 inline-flex rounded-md border bg-muted px-2 py-0.5 text-[11px] font-medium">{currentUser.plan}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild><Link href="/account"><UserRound aria-hidden="true" />My profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/usage"><Sparkles aria-hidden="true" />AI usage & limits</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/billing"><CreditCard aria-hidden="true" />Billing & subscription</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/settings"><Settings aria-hidden="true" />Settings</Link></DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-primary"><Link href="/pricing"><Sparkles aria-hidden="true" />Upgrade for more AI</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={user !== demoUser && !onSignOut} onSelect={() => {
                  if (onSignOut) onSignOut();
                  else setDemoSignedOut(true);
                }}>
                  <LogOut aria-hidden="true" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost"><Link href="/login"><LogIn aria-hidden="true" /><span className="hidden sm:inline">Sign in</span><span className="sr-only sm:hidden">Sign in</span></Link></Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation menu" className="shrink-0 text-muted-foreground">
              <Menu aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-w-[calc(100vw-2rem)]">
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuGroup>
              {workspaceItems.map(({ label, href, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild className={isActive(href) ? "bg-accent" : undefined}>
                  <Link href={href} aria-current={isActive(href) ? "page" : undefined}>
                    <Icon aria-hidden="true" />{label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Resources</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild><Link href="/docs"><BookOpen aria-hidden="true" />Documentation</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/pricing"><Sparkles aria-hidden="true" />Plans & pricing</Link></DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};

export default Header;
