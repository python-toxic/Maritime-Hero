# Feature Visual Guide

After each meaningful UI section or feature implementation, create a concise **Feature Visual Brief** to help a beginner developer understand what was built and how it works.

Inspect the actual implementation and relevant project documentation before preparing the brief. Do not invent functionality or assume planned features are already implemented.

Include only these details:

1. **Feature Name:** A short, meaningful name identifying the section or feature.
2. **Purpose:** What it does and why it exists.
3. **User Interaction:** What the user or admin can do.
4. **Working Flow:** 3–6 simple steps explaining how it works.
5. **Technology Mapping:** Relevant UI, API, backend logic, database, or other mechanisms, showing how they connect. Include only applicable layers.
6. **Key Rule:** Any important condition, permission, or behavior.
7. **Outcome:** What happens when the feature works successfully.

Keep the explanation concise, beginner-friendly, and specific to the actual implementation. Use simple language and concrete details rather than unnecessary technical depth.

Clearly distinguish implemented functionality from planned or unverified functionality. Omit irrelevant fields when necessary.

Return the brief in a copy-ready block titled **FEATURE VISUAL BRIEF**. This text will be provided to a separate AI image generator, so prioritize information that can be translated into a simple flow diagram using labels, icons, boxes, arrows, or other visual elements.

The feature name should also serve as a meaningful reference for the corresponding visual. Do not replace or duplicate the project's existing implementation logs.

---

**FEATURE VISUAL BRIEF**

**Feature Name:** Homepage Services Grid

**Purpose:**
The homepage shows a premium maritime services panel that helps visitors quickly understand the main service offerings and builds trust in the company’s operating expertise.

**User Interaction:**
A visitor reviews the six service cards on the homepage. They can read the short copy and click the “Learn More →” link for a service, or use the “View All Services” link to move into the broader services journey.

**Working Flow:**
1. The homepage route renders the hero section and the Services section.
2. ServicesSection reads the local service data array.
3. The array is filtered to only published items and sorted by priority.
4. Each item is rendered as a card with an image, title, description, and link.
5. The user clicks a “Learn More” link to go to that service detail route.

**Technology Mapping:**
- Frontend: ServicesSection.tsx renders the homepage card grid.
- Data source: a structured mock array containing title, description, image, slug, href, published status, and priority.
- Rendering flow: data -> filter published -> sort by priority -> map cards -> display in the UI.
- Routing: TanStack Router links each service card to a route path such as /services/ihm-services.
- Planned CMS flow: Admins will later choose which services appear on the homepage, while the full service collection will exist separately on a dedicated Services page. This future connection would use the current frontend rendering pattern but would be driven by backend-managed content rather than static mock data.

**Key Rule:**
The homepage section is not the complete service catalog. It shows only the selected, published, priority-ordered services for the homepage. The full collection remains separate and should live on a dedicated Services page when that feature is added.

**Outcome:**
Visitors see a polished six-card homepage services section with deep navy branding, restrained imagery, and clear service navigation. The homepage highlights selected services, while the future dedicated Services page will display the larger catalog of offerings.

---