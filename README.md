
<img width="100" height="100" alt="Srcmap logo" src="https://github.com/user-attachments/assets/ae76978b-d474-4b7b-8314-b54e24acad50" />

 # Srcmap

**Explore GitHub repositories online without cloning.**

Srcmap is a browser-based GitHub repository explorer. Open a public repository in a VS Code-style workspace, browse its file tree, view source code online, search files, and share a link to the exact code. Explore code online without cloning the repository or installing developer tools.

No cloning or installation needed to explore a repository.

[**Launch Srcmap →**](https://srcmap.cc) · [Source code](https://github.com/ayush-khatrii/srcmap) · [Report an issue](https://github.com/ayush-khatrii/srcmap/issues)

<img width="1440" height="1000" alt="Srcmap VS Code-style online GitHub repository workspace" src="https://github.com/user-attachments/assets/f6b5ca64-63d9-4e4c-ae05-fae564ddd1fa" />



*The live Srcmap workspace at srcmap.cc, browsing this project's source code online.*

## Why Srcmap?

Need to explore a GitHub repository without cloning it? Srcmap gives you an online code viewer and VS Code-like workspace directly from a public GitHub URL. Browse folders in a repository tree, open multiple files, read syntax-highlighted source, search within code, and share a link to a file. No clone, local setup, or installation is needed.

- **Explore unfamiliar projects.** Navigate the folder structure and open the files that matter.
- **Learn from real code.** Read implementations with syntax highlighting and line numbers.
- **Share context.** Send a link to a selected file with a search term already applied.

## Features

| Feature | What you can do |
| --- | --- |
| VS Code-style repository tree | Expand folders and browse a GitHub repository in a familiar workspace sidebar. |
| File finder | Filter the tree by file name or path. |
| Syntax-highlighted reader | Read source files with language-aware highlighting and line numbers. |
| In-file code search | Find case-sensitive text, see the match count, and move between occurrences. |
| Shareable views | Copy a link that retains the repository, selected file, and code search. |
| Repository metadata | Inspect the default branch, language, stars, forks, and other repository details. |
| Appearance controls | Switch the interface theme and choose a code-highlighting theme. |

## Get started

1. Open [srcmap.cc](https://srcmap.cc).
2. Choose **Open repository** and paste a public GitHub repository URL, such as `https://github.com/ayush-khatrii/srcmap`.
3. Expand a folder or use **Find a file...** to locate a file.
4. Select the file to read its source. Use the code-search field to find text within it.
5. Select the share button and copy the link to send the same view to someone else.

[Try it with Srcmap's own source →](https://srcmap.cc/?repo=https://github.com/ayush-khatrii/srcmap&file=app/layout.tsx)

## Product tour

### Find the detail that matters

Search the selected file for an exact word or phrase. Matching text is highlighted, and the search controls let you step through each occurrence.

<img width="1440" height="1000" alt="Search source code inside a GitHub repository with Srcmap" src="https://github.com/user-attachments/assets/f6f8ebd3-7068-4cbb-acdc-e3f232a647df" />


| Shortcut | Action |
| --- | --- |
| `Enter` in the search field | Next match |
| `Shift + Enter` in the search field | Previous match |
| `Escape` in the search field | Clear the search |

### Share the code in context

The sharing dialog creates a link to the repository, selected file, and active search. Recipients can open the link and continue exploring in their browser.

<img width="1440" height="1000" alt="Share a selected file and code search from Srcmap" src="https://github.com/user-attachments/assets/30f205a7-e457-476d-add3-f4d8fe810d1e" />




[Open the example shared view →](https://srcmap.cc/?repo=https://github.com/ayush-khatrii/srcmap&file=app/layout.tsx&q=metadata)



## Built with

- **Next.js, React, and TypeScript** for the application and server routes.
- **Tailwind CSS and Radix UI** for styling and interface components.
- **Shiki** for syntax highlighting.
- **TanStack Query** for repository and file data fetching.
- **nuqs** for shareable URL state.
- **GitHub's API** for repository trees, metadata, and file contents.


Created by [Ayush Khatri](https://github.com/ayush-khatrii).
