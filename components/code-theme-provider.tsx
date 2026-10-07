"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  CODE_THEMES, DEFAULT_CODE_THEME, type CodeTheme,
} from "@/constants/code-themes";

type CodeThemeContextValue = {
  codeTheme: CodeTheme;
  setCodeTheme: (theme: string) => void;
};

const CodeThemeContext = createContext<CodeThemeContextValue>({
  codeTheme: DEFAULT_CODE_THEME,
  setCodeTheme: () => undefined,
});

export function CodeThemeProvider({ children }: { children: React.ReactNode }) {
  const [codeTheme, setCurrentTheme] = useState<CodeTheme>(DEFAULT_CODE_THEME);

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
    <CodeThemeContext.Provider value={{ codeTheme, setCodeTheme }}>
      {children}
    </CodeThemeContext.Provider>
  );
}

export function useCodeTheme() {
  return useContext(CodeThemeContext);
}
