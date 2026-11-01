# Screenshot provenance

All eight PNGs in `screenshots/` are genuine Chromium/Playwright captures from the corrected local production application at `/azure-database-navigator/`, captured on **1 November 2026**. They are not deployment evidence, customer screenshots or image-model mock-ups.

The captures were refreshed after correcting badge sizing: candidate tags keep whole words and role badges wrap only between words. The browser matrix also measures the longest word against each badge's content width.

| File | Actual state | Viewport / theme |
|---|---|---|
| `assessment-midflow-light-1024.png` | Question 6, relational access-pattern answer actively selected | 1024 px / light |
| `result-light-1440.png` | SQL Server migration shortlist; why, validation gates, unknowns and evidence | 1440 px / light |
| `result-dark-375.png` | The same full result stacked on mobile | 375 px / dark |
| `explorer-light-1440.png` | Relational family group, Managed Instance technical profile expanded | 1440 px / light |
| `comparison-light-1440.png` | SQL Database/PostgreSQL, common dimensions and five-state legend | 1440 px / light |
| `comparison-dark-768.png` | The same horizontally scrollable comparison at tablet width | 768 px / dark |
| `architecture-light-1440.png` | RAG fixture: retained PostgreSQL, original files, derived search index and boundaries | 1440 px / light |
| `architecture-dark-375.png` | The same diagram stacked, with labelled directional links and failure notes | 375 px / dark |

The browser height is 1000 px. Full-page captures include content beyond the viewport; diagram captures include the actual complete architecture section. For section captures only, screenshot styling makes sticky navigation static to avoid a browser-capture overlay on the content. No text, state, source, result or node is fabricated or removed. The comparison's scroll region intentionally clips off-screen columns on narrow viewports; it does not overflow the page.

The worked fixtures are educational examples, not actual deployments. Independent caches and indexes are not automatically transactionally consistent with original data.

## Reproduce and review

Run `npm run screenshots` with the pinned dependencies and Chromium installed. It preview-builds the application, checks loopback HTTP readiness, captures the named states, rejects page overflow, removes only named superseded images, and closes its browser/server. Inspect every image and then run `npm run build`; preview output is not a release build.

The README and canonical article reference these same captured files. Original captures are licensed under CC BY 4.0; see [content licensing](CONTENT-LICENSE.md).
