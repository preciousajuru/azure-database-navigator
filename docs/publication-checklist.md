# Publication readiness checklist

This checklist prepares a release. It does **not** authorize enabling GitHub Pages, running deployment, publishing an announcement or claiming a live site.

## Repository

- [x] Independent companion repository and product identity.
- [x] MIT source license and CC BY 4.0 article/documentation attribution boundary.
- [x] Source register, research method and decision model.
- [x] Deterministic tests and catalogue-integrity check.
- [x] CI workflow and manual-only Pages workflow prepared.
- [ ] Run repository checks in GitHub Actions on the target default branch.
- [ ] Review all references and service lifecycle notices immediately before release.
- [ ] Enable GitHub Pages only after the project owner authorizes deployment.

## Product and accessibility

- [x] Browser-only, static architecture; no account, backend, telemetry, runtime CDN or Azure credentials.
- [x] Responsive workspace, light default theme, dark theme, keyboard-operable controls and reduced-motion handling.
- [ ] Manual browser pass at phone, tablet, narrow desktop and desktop widths.
- [ ] Verify keyboard-only flow and screen-reader labels in a real browser.
- [ ] Create and review genuine screenshots from the actual application after the visual pass.

## Editorial publication

- [x] One canonical article source at `docs/article.html`.
- [x] Article title, author, publication date, British English and disclaimer included.
- [ ] Proofread against current sources and check every outbound link at publication time.
- [ ] Obtain final editorial approval.
- [ ] Publish the companion article only after explicit authorization.

## Community impact and announcement

- [x] A community impact template is provided in `docs/community-impact-template.md`.
- [x] A natural, unpublished LinkedIn announcement draft is provided in `docs/linkedin-announcement.md`.
- [ ] Populate impact metrics only from verified public evidence; no invented reach, adoption or user stories.
- [ ] Publish the announcement only after the site/article is actually live and the owner authorizes it.

## Publication claims

Do not claim a live URL, successful deployment, screenshots, traffic, adoption or outcomes unless independently verified. Do not promise that recommendations guarantee availability, compliance, cost or compatibility.
