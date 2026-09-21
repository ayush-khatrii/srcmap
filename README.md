
<img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/ae76978b-d474-4b7b-8314-b54e24acad50" />

 # Srcmap

**Explore GitHub code without the setup.**

Srcmap opens public GitHub repositories in a familiar, VS Code-style workspace in your browser. Browse folders, find files, and read syntax-highlighted code. Search for the detail you need, then share a link that brings someone straight to the same file and search.

No cloning or installation needed to explore a repository.

[**Launch Srcmap →**](https://srcmap.cc) · [Source code](https://github.com/ayush-khatrii/srcmap) · [Report an issue](https://github.com/ayush-khatrii/srcmap/issues)

<img width="1440" height="1000" alt="image" src="https://github.com/user-attachments/assets/f6b5ca64-63d9-4e4c-ae05-fae564ddd1fa" />



*The live workspace at srcmap.cc, browsing this project's source. The current interface displays the srcmap name.*

## Why Srcmap?

Sometimes you just need to understand how a project works, check an implementation, or send a teammate a useful piece of code. Srcmap gives you a focused reading workspace directly from a public GitHub URL, so you can start exploring without setting up a local environment.

- **Explore unfamiliar projects.** Navigate the folder structure and open the files that matter.
- **Learn from real code.** Read implementations with syntax highlighting and line numbers.
- **Share context.** Send a link to a selected file with a search term already applied.

## Features

| Feature | What you can do |
| --- | --- |
| Repository explorer | Expand folders and browse files in a familiar sidebar. |
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

[Try it with Srcmap's own source →](https://www.srcmap.cc/?repo=https://github.com/ayush-khatrii/srcpeek&file=app/layout.tsx)

## Product tour

### Find the detail that matters

Search the selected file for an exact word or phrase. Matching text is highlighted, and the search controls let you step through each occurrence.

<img width="1440" height="1000" alt="image" src="https://github.com/user-attachments/assets/f6f8ebd3-7068-4cbb-acdc-e3f232a647df" />


| Shortcut | Action |
| --- | --- |
| `Enter` in the search field | Next match |
| `Shift + Enter` in the search field | Previous match |
| `Escape` in the search field | Clear the search |

### Share the code in context

The sharing dialog creates a link to the repository, selected file, and active search. Recipients can open the link and continue exploring in their browser.

<img width="1440" height="1000" alt="image" src="https://github.com/user-attachments/assets/30f205a7-e457-476d-add3-f4d8fe810d1e" />




[Open the example shared view →](https://www.srcmap.cc/?repo=https://github.com/ayush-khatrii/srcpeek&file=app/layout.tsx&q=metadata)



## Built with

- **Next.js, React, and TypeScript** for the application and server routes.
- **Tailwind CSS and Radix UI** for styling and interface components.
- **Shiki** for syntax highlighting.
- **TanStack Query** for repository and file data fetching.
- **nuqs** for shareable URL state.
- **GitHub's API** for repository trees, metadata, and file contents.


Created by [Ayush Khatri](https://github.com/ayush-khatrii).
