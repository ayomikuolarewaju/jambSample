---
name: jamb-app-validation
description: "Use when: validating a Next.js JAMB CBT app, checking exam flows, reviewing guest access, Supabase auth/RLS, or confirming that the app behaves correctly before shipping. Covers bug triage, flow validation, and regression checks for this project."
---

# JAMB App Validation

Use this skill to validate new changes or catch regressions in the JAMB CBT portal before launching or merging work.

## When to use

Use this skill when any of the following are true:
- A feature or fix is being checked in the exam flow.
- Guest access, invite links, or authentication logic may have changed.
- Supabase schemas, RLS policies, or server/client boundary changes need verification.
- A new page or route may have introduced a broken flow.
- You need a structured pre-ship checklist for this application.

## Core process

1. Identify the changed behavior.
   - Determine exactly what feature, page, route, or flow was modified.
   - Check the user-facing effect and the system component that owns it.

2. Trace the relevant data flow.
   - Follow the request from route/page to Supabase or server logic.
   - Verify that server-only code truly stays server-side.
   - Check whether a guest token, user session, or protected query is being used correctly.

3. Validate the primary user path.
   - Test the expected success flow end-to-end.
   - Confirm the user can start, complete, and see the relevant result without surprises.

4. Validate the edge cases.
   - Check expired guest links.
   - Check missing or invalid session state.
   - Check unauthorized access and incorrect permissions.
   - Check database errors, empty states, and invalid payloads.

5. Verify data integrity.
   - Ensure rows are created in the correct table.
   - Check whether the expected relationship between users, guest sessions, and results is preserved.
   - Confirm RLS or server checks are enforcing access boundaries.

6. Run the project checks.
   - Run linting and any relevant build validation for the app.
   - If a UI route is changed, inspect it in a browser or local run to make sure the page renders correctly.

7. Confirm completion criteria.
   - The changed flow works in the happy path.
   - Protected data remains scoped correctly.
   - Broken or unauthorized states fail safely.
   - No obvious lint or runtime errors appear.

## Decision points

- If the change affects guest exam access, validate token creation, expiry, and authorization.
- If the change affects admin access, validate role gates and restricted pages.
- If the change affects exam data, validate question loading, answer saving, and result generation.
- If the change affects Supabase schema, confirm migrations and RLS rules still match the app usage.
- If the change affects email delivery, validate link generation, templates, and delivery flow.

## Quality checklist

Before finalizing validation, confirm all of the following:
- The user journey works from start to finish.
- Access is correctly restricted to authorized users.
- The app does not leak privileged data between guest and registered flows.
- The UI and backend still align with the intended product flow.
- Lint/build validation passes, or any remaining issue is clearly documented.

## Example prompts

- Validate the guest exam flow for expired tokens and unauthorized access.
- Check whether the latest change broke the admin dashboard flow.
- Review the exam result path for correctness and security.
- Run a pre-ship validation check for this JAMB CBT app.
- Verify the Supabase RLS and server/client boundary after this update.

## Related customizations

If the workflow is broader than one app, consider a more general Next.js validation skill. If the task is specific to a single feature, create a focused prompt or a feature-specific skill instead.
