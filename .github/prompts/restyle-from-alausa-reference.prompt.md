---
name: "Restyle Website From Alausa Reference"
description: "Use when adapting this website's visual design to match the observed look and feel of alausadirectory.com while preserving the app's content and behavior."
argument-hint: "Pages or UI areas to restyle (optional; defaults to the whole site)"
agent: "agent"
---

Restyle this workspace's website to align its look and feel with the live reference at https://alausadirectory.com.

Target scope: ${input:scope:Which pages or UI areas should be restyled? Leave blank for a site-wide pass.}

Before editing:

1. Open and inspect the live reference website. Review its homepage and relevant pages, including a narrow/mobile viewport when browser tools allow. Observe its actual typography, color palette, layout, navigation, imagery, spacing, and responsive behavior. Do not claim to have inspected it if you could not access it; pause and explain the limitation or request screenshots before making visual changes.
2. Read this workspace's instructions and inspect the existing pages, shared components, and styles relevant to the target scope. Follow the project's framework guidance and existing conventions.
3. Form a concise design direction from what you observed, then apply it consistently to the requested scope. The observed homepage cues include deep royal blue, bright yellow accents, a large serif display heading paired with sans-serif supporting text, and a restrained diagonal stripe motif; verify these against the live pages and adapt them thoughtfully to this app. Use the reference for visual direction rather than copying its text, branding, or assets; prefer this project's existing content and assets.

Implementation requirements:

- Preserve the site's content, navigation, accessibility, responsive behavior, and working user flows, especially registration, exam-taking, and results flows.
- Keep changes focused on visual presentation unless a small structural change is needed to achieve the design.
- Reuse or extend existing shared styles and components where appropriate; avoid unrelated refactors.
- Check the affected pages at desktop and mobile sizes when browser tools are available, and run the narrowest relevant lint, typecheck, or tests.

When finished, summarize the observed design traits you applied, the areas changed, and the checks you ran. Call out anything you could not inspect or verify.