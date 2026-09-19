import type { ShikiTransformer } from "shiki";

export type CodeSearchMatch = { line: number; column: number };

// Kibo's word markers match literal text, including its letter case.
export function findCodeMatches(code: string, search: string) {
  const matches: CodeSearchMatch[] = [];
  if (!search) return matches;

  code.split("\n").forEach((line, index) => {
    let column = line.indexOf(search);
    while (column !== -1) {
      matches.push({ line: index + 1, column });
      column = line.indexOf(search, column + 1);
    }
  });

  return matches;
}

// Add the marker AFTER syntax tokenization so it works in Markdown, Python,
// and other languages too. Kibo's built-in transformer highlights the words
// and removes the marker. The original source and copy button stay unchanged.
export function prepareSearchAnnotations(search: string): ShikiTransformer {
  // These characters have special meanings inside a Kibo word marker.
  const word = search.replace(/[\\:\]]/g, "\\$&");
  const marker = ` // [!code word:${word}:1]`; // :1 limits it to this line.

  return {
    tokens(lines) {
      if (!search) return;
      lines.forEach((line) => {
        const text = line.map((token) => token.content).join("");
        if (text.includes(search)) line.push({ content: marker, offset: 0 });
      });
    },
  };
}
