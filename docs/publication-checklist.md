# Publication readiness checklist

This checklist prepares a release. It does **not** authorise enabling GitHub Pages, running deployment, publishing an announcement or claiming a live site.

## Repository

- [x] Independent companion repository and product identity.
- [x] MIT source licence and CC BY 4.0 article/documentation attribution boundary.
- [x] Source register, research method and decision model.
- [x] Deterministic tests and catalogue-integrity check.
- [x] CI workflow and manual-only Pages workflow prepared.
- [ ] Run repository checks in GitHub Actions on the target default branch.
- [ ] Review all references and service lifecycle notices immediately before release.
- [ ] Enable GitHub Pages only after the project owner authorizes deployment.

## Product and accessibility

- [x] Browser-only, static architecture; no account, backend, telemetry, runtime CDN or Azure credentials.
- [x] Responsive workspace, light default theme, dark theme, keyboard-operable controls and reduced-motion handling.
- [x] Chromium workflow and captured visual pass at 375/768/1024/1440 px in light and dark.
- [x] Automated keyboard/focus, reduced-motion and WCAG A/AA checks in the real browser.
- [ ] Review using an actual screen reader and additional browser engines.
- [x] Eight meaningful genuine screenshots: active assessment, complete migration results, expanded explorer profile, comparison and light/desktop plus dark/mobile architecture. The full browser matrix covers all four widths/both themes.

## Editorial publication

- [x] One canonical article source at `docs/article.md`, with generated HTML and portable copies.
- [x] Article title, author, article date, British English and disclaimer included.
- [ ] Proofread against current sources and check every outbound link at publication time.
- [ ] Obtain final editorial approval.
- [ ] Publish the companion article only after explicit authorisation.

## Community impact and announcement

- [x] A community impact template is provided in `docs/community-impact-template.md`.
- [x] A natural, unpublished LinkedIn announcement draft is provided in `docs/linkedin-announcement.md`.
- [ ] Populate impact metrics only from verified public evidence; no invented reach, adoption or user stories.
- [ ] Publish the announcement only after the site/article is actually live and the owner authorizes it.

## Publication claims

Do not claim a live URL, successful deployment, screenshots, traffic, adoption or outcomes unless independently verified. Do not promise that recommendations guarantee availability, compliance, cost or compatibility.

## Local verification evidence

The local checks on 1 November 2026 cover deterministic rules, catalogue/source integrity, rendered pages/assets/anchors, browser workflows, accessibility and genuine screenshots. The screenshot record describes capture provenance; the images do not demonstrate deployment.

`npm audit --audit-level=low` reported zero known advisory findings for the pinned dependency tree. The build/test-only dependency licence metadata is MIT (`marked`), Apache-2.0 (Playwright), and MPL-2.0 (axe-core integration). These packages are not loaded by the published application.

A read-only pre-publication security review found no reportable vulnerability in the static/runtime, Markdown build, loopback server or workflow boundary. Advisory and targeted credential checks do not establish package provenance, exclude future vulnerabilities or substitute for a comprehensive organisational secret scan.

The targeted repository scan checks private-key blocks, common GitHub/AWS token patterns and Azure Storage account-key strings. It is not a comprehensive secret certification. The corrected suite contains 70 Node tests and 64 Chromium workflow/accessibility tests; the full build validates 9 HTML pages and includes 8 genuine screenshots. A 615,528-result sweep prunes answers using question applicability and checks named unknowns plus document alternatives. A separate 11,961-result engine-inclusive sweep covers engine/client contracts, migration intent and composite document roles. These are not exhaustive proofs across every configuration input. Browser checks measure badge/tag/chip/pill words across every scenario, explorer family and comparison in all eight viewport/theme projects.

Publication still requires owner approval, GitHub Actions verification, current external source/link review, actual screen-reader review and independently verified public application/article URLs after authorised deployment.

## After explicit authorisation — release gates

- Push the reviewed code before sharing an article link that presents the public repository as the implemented project. The public repository is not evidence of these local commits until an authorised push.
- Run CI on `main`; the manual Pages workflow also requires `github.ref == 'refs/heads/main'` and affirmative confirmation. Do not enable Pages or invoke it without owner approval.
- Verify the actual deployment URL and every linked page/assets; record HTTP 200 after redirects and inspect the public rendering.
- Update article captions/footer that say “running locally” or “not a deployed website”, the byline/review date where genuinely rechecked, README status and the separate LinkedIn URL fields using only verified URLs.
- Remove release-dependent “pending” wording only after the corresponding task has actually completed. Do not fabricate a publication date or URL.
- Re-run source/link/lifecycle review, all local checks, security advisory and credential-pattern scans, browser checks and screenshot inspection for the release build.
- Obtain editorial approval and separate authorisation to publish the article or post. The LinkedIn draft, checklist and community template remain excluded from `dist/`.
