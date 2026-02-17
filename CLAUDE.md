# Project Guidelines

## Workflow
- When making changes, before any tool usage, explain what is being done.
- Explain the changes made, before and after
- When editing HTML files with Hebrew/RTL text, always verify replacements in context — never do blind bulk find-and-replace. Check for concatenated words, grammatical gender forms, and broken strings after each replacement pass.
- For PDF generation in this project, use html2pdf.js (not jsPDF) for Hebrew/RTL support. Always test that the PDF is non-blank by ensuring the element is visible and fully rendered before capture. Avoid off-screen positioning or opacity:0 hacks — they produce blank PDFs.
- This project uses a service worker. After making changes to JS/HTML files, always update the service worker cache version or add cache-busting. Stale service worker caches have caused old code to load instead of new fixes.
- When modifying PWA install behavior, only change the specific platform requested (iOS vs Android). Do not add query parameters (?v=X) to icon paths in manifest.json as this breaks PWABuilder recognition.
- If a bug fix attempt doesn't work after 2 tries, stop and re-examine the root cause from scratch rather than layering more hypotheses. Ask the user for browser console output or a screen recording if needed.