"use client";

import { Toast as ToastPrimitive } from "radix-ui";
import { X } from "lucide-react";

// A small shadcn-style toast using the existing Radix UI primitives.
export function SelectionToast({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ToastPrimitive.Provider duration={3000}>
      <ToastPrimitive.Root open={open} onOpenChange={onOpenChange}
        className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4 text-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out">
        <ToastPrimitive.Title className="text-sm font-medium">Select a file first</ToastPrimitive.Title>
        <ToastPrimitive.Close aria-label="Dismiss notification" className="rounded-sm p-1 hover:bg-muted"><X className="size-4" /></ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </ToastPrimitive.Provider>
  );
}
