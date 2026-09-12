import type { IconType } from "react-icons";
import { FaFolder, FaFolderOpen } from "react-icons/fa6";
import {
  SiAstro,
  SiBun,
  SiC,
  SiCoffeescript,
  SiCplusplus,
  SiCss,
  SiDart,
  SiDocker,
  SiDotenv,
  SiEslint,
  SiGit,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiHtml5,
  SiJavascript,
  SiJest,
  SiJson,
  SiKotlin,
  SiLess,
  SiMarkdown,
  SiMdx,
  SiNextdotjs,
  SiNpm,
  SiOpenjdk,
  SiPerl,
  SiPhp,
  SiPnpm,
  SiPrettier,
  SiPrisma,
  SiPug,
  SiPython,
  SiR,
  SiReact,
  SiRuby,
  SiRust,
  SiSass,
  SiSharp,
  SiSvelte,
  SiSvg,
  SiSwift,
  SiTailwindcss,
  SiToml,
  SiTypescript,
  SiVite,
  SiVitest,
  SiVuedotjs,
  SiWebpack,
  SiYaml,
  SiYarn,
} from "react-icons/si";
import { VscFile, VscFileMedia, VscLock } from "react-icons/vsc";

type FileIcon = {
  icon: IconType;
  color: string;
};

const folderIcon: FileIcon = { icon: FaFolder, color: "#E8B84A" };
const openFolderIcon: FileIcon = { icon: FaFolderOpen, color: "#E8B84A" };
const defaultFileIcon: FileIcon = { icon: VscFile, color: "#9CA3AF" };

const extensionIcons: Record<string, FileIcon> = {
  tsx: { icon: SiReact, color: "#61DAFB" },
  jsx: { icon: SiReact, color: "#61DAFB" },
  ts: { icon: SiTypescript, color: "#3178C6" },
  js: { icon: SiJavascript, color: "#F7DF1E" },
  mjs: { icon: SiJavascript, color: "#F7DF1E" },
  cjs: { icon: SiJavascript, color: "#F7DF1E" },
  json: { icon: SiJson, color: "#F5C518" },
  html: { icon: SiHtml5, color: "#E34F26" },
  htm: { icon: SiHtml5, color: "#E34F26" },
  css: { icon: SiCss, color: "#1572B6" },
  scss: { icon: SiSass, color: "#CC6699" },
  sass: { icon: SiSass, color: "#CC6699" },
  less: { icon: SiLess, color: "#1D365D" },
  md: { icon: SiMarkdown, color: "#519ABA" },
  mdx: { icon: SiMdx, color: "#F9AC00" },
  py: { icon: SiPython, color: "#3776AB" },
  go: { icon: SiGo, color: "#00ADD8" },
  rs: { icon: SiRust, color: "#CE422B" },
  c: { icon: SiC, color: "#A8B9CC" },
  h: { icon: SiC, color: "#A8B9CC" },
  cpp: { icon: SiCplusplus, color: "#00599C" },
  cc: { icon: SiCplusplus, color: "#00599C" },
  cs: { icon: SiSharp, color: "#512BD4" },
  java: { icon: SiOpenjdk, color: "#ED8B00" },
  php: { icon: SiPhp, color: "#777BB4" },
  rb: { icon: SiRuby, color: "#CC342D" },
  swift: { icon: SiSwift, color: "#F05138" },
  kt: { icon: SiKotlin, color: "#7F52FF" },
  dart: { icon: SiDart, color: "#0175C2" },
  vue: { icon: SiVuedotjs, color: "#4FC08D" },
  svelte: { icon: SiSvelte, color: "#FF3E00" },
  astro: { icon: SiAstro, color: "#FF5D01" },
  graphql: { icon: SiGraphql, color: "#E10098" },
  gql: { icon: SiGraphql, color: "#E10098" },
  sh: { icon: SiGnubash, color: "#4EAA25" },
  bash: { icon: SiGnubash, color: "#4EAA25" },
  yml: { icon: SiYaml, color: "#CB171E" },
  yaml: { icon: SiYaml, color: "#CB171E" },
  toml: { icon: SiToml, color: "#9C4121" },
  prisma: { icon: SiPrisma, color: "#5A67D8" },
  pug: { icon: SiPug, color: "#A86454" },
  coffee: { icon: SiCoffeescript, color: "#2F2625" },
  pl: { icon: SiPerl, color: "#39457E" },
  r: { icon: SiR, color: "#276DC3" },
  svg: { icon: SiSvg, color: "#FFB13B" },
  png: { icon: VscFileMedia, color: "#C586C0" },
  jpg: { icon: VscFileMedia, color: "#C586C0" },
  jpeg: { icon: VscFileMedia, color: "#C586C0" },
  gif: { icon: VscFileMedia, color: "#C586C0" },
  webp: { icon: VscFileMedia, color: "#C586C0" },
  ico: { icon: VscFileMedia, color: "#C586C0" },
  lock: { icon: VscLock, color: "#9CA3AF" },
};

function getSpecialFileIcon(filename: string): FileIcon | undefined {
  if (filename.startsWith("readme")) return { icon: SiMarkdown, color: "#519ABA" };
  if (filename.startsWith(".env")) return { icon: SiDotenv, color: "#ECD53F" };
  if (filename.startsWith("dockerfile")) return { icon: SiDocker, color: "#2496ED" };
  if (filename.startsWith("next.config")) return { icon: SiNextdotjs, color: "currentColor" };
  if (filename.startsWith("tsconfig")) return { icon: SiTypescript, color: "#3178C6" };
  if (filename.startsWith("vite.config")) return { icon: SiVite, color: "#646CFF" };
  if (filename.startsWith("webpack.config")) return { icon: SiWebpack, color: "#8DD6F9" };
  if (filename.startsWith("tailwind.config")) return { icon: SiTailwindcss, color: "#06B6D4" };
  if (filename.startsWith("eslint.config") || filename.startsWith(".eslintrc")) {
    return { icon: SiEslint, color: "#4B32C3" };
  }
  if (filename.startsWith("prettier.config") || filename.startsWith(".prettierrc")) {
    return { icon: SiPrettier, color: "#F7B93E" };
  }
  if (filename === "package.json" || filename === "package-lock.json") {
    return { icon: SiNpm, color: "#CB3837" };
  }
  if (filename.startsWith("pnpm-lock")) return { icon: SiPnpm, color: "#F69220" };
  if (filename === "yarn.lock") return { icon: SiYarn, color: "#2C8EBB" };
  if (filename.startsWith("bun.lock")) return { icon: SiBun, color: "#FBF0DF" };
  if (filename === ".gitignore" || filename === ".gitattributes") {
    return { icon: SiGit, color: "#F05032" };
  }
  if (filename.startsWith("jest.config")) return { icon: SiJest, color: "#C21325" };
  if (filename.startsWith("vitest.config")) return { icon: SiVitest, color: "#6E9F18" };
  return undefined;
}

export function FileTreeIcon({ path, isFolder, isOpen = false }: {
  path: string;
  isFolder: boolean;
  isOpen?: boolean;
}) {
  const filename = path.split("/").pop()?.toLowerCase() ?? "";
  const extension = filename.split(".").pop() ?? "";
  let selectedIcon = getSpecialFileIcon(filename) ?? extensionIcons[extension] ?? defaultFileIcon;

  if (isFolder) {
    selectedIcon = isOpen ? openFolderIcon : folderIcon;
  }

  const Icon = selectedIcon.icon;

  return (
    <Icon
      aria-hidden="true"
      className="size-4"
      style={{ color: selectedIcon.color }}
    />
  );
}
