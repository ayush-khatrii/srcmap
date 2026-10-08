"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  CODE_THEMES, DEFAULT_CODE_THEME, type CodeTheme,
} from "@/constants/code-themes";

type CodeThemeContextValue = {
  codeTheme: CodeTheme;
  codeBackground: string;
  codeForeground: string;
  setCodeTheme: (theme: string) => void;
};

const CodeThemeContext = createContext<CodeThemeContextValue>({
  codeTheme: DEFAULT_CODE_THEME,
  codeBackground: "#0d1117",
  codeForeground: "#e6edf3",
  setCodeTheme: () => undefined,
});

export function CodeThemeProvider({ children }: { children: React.ReactNode }) {
  const [codeTheme, setCurrentTheme] = useState<CodeTheme>(DEFAULT_CODE_THEME);

  const [colors, setColors] = useState({ background: "#0d1117", foreground: "#e6edf3" });

  useEffect(() => {
    let cancelled = false;
    import("shiki").then(async ({ getSingletonHighlighter }) => {
      const highlighter = await getSingletonHighlighter({ themes: [codeTheme], langs: [] });
      const theme = highlighter.getTheme(codeTheme);
      if (!cancelled) setColors({ background: theme.bg, foreground: theme.fg });
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [codeTheme]);

  function setCodeTheme(theme: string) {
    const isSupported = CODE_THEMES.some((item) => item.id === theme);
    if (!isSupported) return;

    setCurrentTheme(theme as CodeTheme);
    localStorage.setItem("srcmap-code-theme", theme);
  }

  useEffect(() => {
    const storageKey = "srcmap-code-theme";
    const currentTheme = localStorage.getItem(storageKey);
    const legacyKey = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .find((key) => key?.endsWith("-code-theme"));
    const savedTheme = currentTheme ?? (legacyKey ? localStorage.getItem(legacyKey) : null);
    if (savedTheme) {
      setCodeTheme(savedTheme);
      if (!currentTheme && legacyKey) localStorage.removeItem(legacyKey);
    }
  }, []);

  return (
    <CodeThemeContext.Provider value={{ codeTheme, setCodeTheme, codeBackground: colors.background, codeForeground: colors.foreground }}>
      {children}
    </CodeThemeContext.Provider>
  );
}

export function useCodeTheme() {
  return useContext(CodeThemeContext);
}
