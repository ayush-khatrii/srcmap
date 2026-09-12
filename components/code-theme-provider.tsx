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
    localStorage.setItem("srcpeek-code-theme", theme);
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("srcpeek-code-theme");
    if (savedTheme) setCodeTheme(savedTheme);
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
