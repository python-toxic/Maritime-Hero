# Feature Log: Homepage Navbar and Hero Update

## 1) What changed and why

This pass tightens the homepage to better match the original reference: the hero keeps the same editorial copy and CTA structure, but the text column is widened to avoid wrapping, the headline is forced into the intended three-line composition, and the overall layout is tightened to match the original hero proportions. The vessel image is now sourced from the existing BG-Vessel asset, and the service highlights use subtle outline icons in a single horizontal strip to match the mock more closely.

The navbar was also refined to align more closely with the original: compact vertical height, increased logo emphasis, balanced nav spacing, and a navy Contact Us button in the right cluster. Subsequent refinements removed the "Our People" entry, widened the spacing between nav items, and removed the search icon so the header reads more cleanly and matches the current design direction.

The homepage was then restructured into dedicated section files for maintainability. A reusable Services section was created with data-driven service cards, consistent premium maritime typography, and a six-card 3x2 layout matching the provided reference. This keeps the homepage easier to extend without causing large merge issues or tightly coupled component logic.

## 2) Files created, modified, or deleted

Modified:
- [src/routes/index.tsx](src/routes/index.tsx)
- [src/shared/layout/SiteHeader.tsx](src/shared/layout/SiteHeader.tsx)

Created:
- [src/features/home/HeroSection.tsx](src/features/home/HeroSection.tsx)
- [src/features/home/ServicesSection.tsx](src/features/home/ServicesSection.tsx)

Deleted:
- None

## 3) How the feature works

- [src/routes/index.tsx](src/routes/index.tsx) renders the root homepage as a composition of dedicated section components.
- [src/features/home/HeroSection.tsx](src/features/home/HeroSection.tsx) owns the hero layout, background image treatment, and primary CTA messaging.
- [src/features/home/ServicesSection.tsx](src/features/home/ServicesSection.tsx) owns the reusable service card grid, data-based rendering, and per-card linking structure.
- The service cards are driven by a structured array, with fields for title, description, image, slug, href, published status, and priority so administrators can later replace mock content with CMS-managed data without rewriting the component markup.
- The homepage displays the published and priority-sorted services in a responsive 3-column desktop layout and stacked mobile pattern, keeping the maritime corporate aesthetic with restrained imagery, deep navy typography, subtle borders, and understated links.
- [src/shared/layout/SiteHeader.tsx](src/shared/layout/SiteHeader.tsx) keeps the existing nav structure, preserves working links, and refines spacing to align more closely with the provided reference.
- The latest navbar changes remove the "Our People" link, increase the gap between menu items, and remove the standalone search button so the header stays simple and uncluttered.

## 4) What could fail and how to diagnose it

Potential issues:
- Image path mismatch if the BG-Vessel asset is moved or renamed.
  - Check the import in [src/routes/index.tsx](src/routes/index.tsx).
- Typography spacing differences on smaller screens or alternate browser rendering.
  - Review the hero text width and the serif stack in [src/routes/index.tsx](src/routes/index.tsx).
- Mobile menu behavior if future nav changes alter the responsive breakpoint.
  - Review the lg breakpoint logic in [src/shared/layout/SiteHeader.tsx](src/shared/layout/SiteHeader.tsx).
- CTA anchor sections not yet defined if the landing page later gains real sections.
  - Verify the href targets before publishing.

## 5) Tests passed or failed

Passed:
- `npm run build` — succeeded after the homepage section split and service grid implementation.
- `npx eslint src/routes/index.tsx src/features/home/HeroSection.tsx src/features/home/ServicesSection.tsx src/shared/layout/SiteHeader.tsx` — completed with no lint errors during the verification pass.

Failed:
- No lint or build failures were observed in the verification run.

Notes:
- The latest changes are visual and structure-focused, so the build validation served as the primary safeguard.

## 6) Documentation needs updating

- No additional business documentation was required for this design-facing update.
- If the final vessel background asset is replaced by a production image, update the imported asset reference in [src/routes/index.tsx](src/routes/index.tsx) to the final file if it differs from the existing BG-Vessel source.
- If anchor links are later wired to actual sections, confirm the headings in the nav correspond to the right page destinations.
## 2026-10-30 — SOS India navigation and content redesign plan

## 1) What changed and why

- Created a content-first redesign plan based on the provided SOS India website-content inventory, DNV navbar references, and current public-site code.
- The plan proposes a tailored four-menu navigation, useful mega-menu groupings, page/content placement, validation gates for claims, implementation phases, and success criteria. It treats the DNV screenshots as an interaction/hierarchy reference and avoids inventing SOS India business areas.

## 2) Files created, modified, or deleted

Created:
- [Documentation/SOS_India_Navigation_and_Content_Redesign_Plan.md](Documentation/SOS_India_Navigation_and_Content_Redesign_Plan.md)

Modified:
- [Ft-Logs.md](Ft-Logs.md)

Deleted:
- None

## 3) How the plan works

- The plan maps the six extracted service categories into buyer-relevant groups, gives Training a learner-focused route, reuses Insights and FAQs, groups company and credentials under About SOS, and keeps Request a Quote persistent.
- It distinguishes source inventory from approved copy, records client verification requirements, matches the intended CMS scope, and flags current anchors and destinations to resolve before implementation.

## 4) What could fail and how to diagnose it

- The extracted PDF may be incomplete or stale. Compare its inventory with the live site and client-approved source material before migration.
- Menu links depend on destinations being implemented or mapped. Validate the route/link map before wiring the menu.
- Certification, regulatory, attribution, leadership, and logo claims can create inaccurate public content if published without confirmation. Resolve the Section 6 checklist with the client.

## 5) Tests passed or failed

- No tests were run; this was a planning/documentation-only update.

## 6) Documentation needs updating

- This plan should be revised after client sign-off on top-level labels, page scope, CMS ownership, and claim verification.
- No code documentation was changed.

## 2026-10-30 — SOS India public navigation and content paths

## 1) What changed and why

- Replaced the simple header links with four grouped mega menus: Services, Training, Insights, and About SOS. Services uses a left-side group selector; course links point to course cards; the contact/quote action remains persistent.
- Added real public destinations for the service catalogue and service details, training, About, credentials, certificate verification, contact, and Careers so menu links lead somewhere purposeful.
- Updated the homepage service CTA so “View All Services” leads to Services, changed the hero's service CTA and focus copy, and added links to Insights, FAQs, credentials, and contact.
- Updated the footer with real public-site destinations and clickable email/phone actions. Generated route declarations from the route files using the configured TanStack Router Vite plugin.
- Kept service/credential descriptions scoped to the provided inventory. Exact certification scope, status, staff details, office information, and other claims still need client confirmation before production publication.

## 2) Files created, modified, or deleted

Created:
- [src/features/public/PublicPage.tsx](src/features/public/PublicPage.tsx)
- [src/features/public/serviceContent.ts](src/features/public/serviceContent.ts)
- [src/features/home/NextStepsSection.tsx](src/features/home/NextStepsSection.tsx)
- [src/routes/services.index.tsx](src/routes/services.index.tsx)
- [src/routes/services.$slug.tsx](src/routes/services.$slug.tsx)
- [src/routes/training.tsx](src/routes/training.tsx)
- [src/routes/about.tsx](src/routes/about.tsx)
- [src/routes/credentials.tsx](src/routes/credentials.tsx)
- [src/routes/certificate-verification.tsx](src/routes/certificate-verification.tsx)
- [src/routes/contact.tsx](src/routes/contact.tsx)
- [src/routes/careers.tsx](src/routes/careers.tsx)

Modified:
- [src/shared/layout/SiteHeader.tsx](src/shared/layout/SiteHeader.tsx)
- [src/shared/layout/SiteFooter.tsx](src/shared/layout/SiteFooter.tsx)
- [src/features/home/HeroSection.tsx](src/features/home/HeroSection.tsx)
- [src/features/home/ServicesSection.tsx](src/features/home/ServicesSection.tsx)
- [src/features/home/Training.tsx](src/features/home/Training.tsx)
- [src/routes/index.tsx](src/routes/index.tsx)
- [src/routeTree.gen.ts](src/routeTree.gen.ts) (generated by the router plugin)
- [Ft-Logs.md](Ft-Logs.md)

Deleted:
- None.

## 3) How the feature works

- The shared header renders desktop mega menus and mobile accordions. Menu items use application routes, course anchors, and a persistent contact route. Escape and outside clicks close the open menu.
- Service catalogue and detail routes share data from `serviceContent.ts`; each detail page includes the listed scope areas and a contextual quote action.
- Training reuses the existing training component and links each course card to a relevant enquiry. The public information routes use a shared page/section/card presentation.
- The homepage still reuses the existing Insights and FAQ pages and now gives visitors direct next-step links.

## 4) What could fail and how to diagnose it

- The quote action uses an email-client `mailto:` link because no public inquiry API is present in the project. If SOS India wants an on-page submission workflow, it needs an approved form destination and backend handling.
- Certificate verification is a contact workflow, not a live certificate database lookup; the page states that plainly.
- The new employee/job and course content does not add CMS APIs or schemas. Existing project scope notes these as managed content types, but the current available public code does not expose those content routes; connect them when that CMS work is available.
- Confirm route behavior under the `/Insights/` deployment base, especially fragment links to course cards and recycling support.
- Confirm all source-derived contact, leadership, credential, regulatory, logo, and service-scope details with SOS India before production use.

## 5) Tests passed or failed

- No tests, lint, or production build were run in this implementation pass.
- Started the local Vite development server briefly so the configured router plugin could regenerate `src/routeTree.gen.ts`, then stopped the server.

## 6) Documentation needs updating

- Revise [Documentation/SOS_India_Navigation_and_Content_Redesign_Plan.md](Documentation/SOS_India_Navigation_and_Content_Redesign_Plan.md) after client approval of menu labels, content claims, and contact/verification workflows.
- If an inquiry API or managed Courses/Employees/Job Openings pages are added, update the route and CMS implementation notes accordingly.

