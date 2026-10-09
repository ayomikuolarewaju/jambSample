# Production Readiness

**Status: blocked. Do not launch with the current database access policies.** This checklist records the verified release blockers and configuration still needed; it is not a security certification or legal opinion.

## Completed preparation

- Added a public trademark and independence notice at `/trademark`. It uses `Eko Free CBT Hub™` without claiming registration and disclaims affiliation with JAMB or government agencies.
- Invite emails now require `NEXT_PUBLIC_SITE_URL` in production and reject non-HTTPS production origins.
- Added `.env.example` with variable names only. Keep actual credentials in local environment files or the hosting provider's encrypted settings.

## Release blockers

### Public database access exposes exam and guest data

- `supabase/migrations/003_invite_access_token.sql` gives public access to invite leads, guest sessions, guest answers, and guest results. Invite lead rows include email addresses and access tokens.
- Guest exam pages query those tables directly with a public key. The answer and submission APIs accept a session ID without proving possession of that invite's token.
- The public questions policy allows selecting `correct_option`, so answer keys can be read by unauthenticated clients.
- `supabase/migrations/004_admin.sql` grants unrestricted writes to questions and app settings.

Before launch, move guest session creation, reads, answer writes, and submissions to server routes that validate a high-entropy, expiring guest credential. Remove public table-wide policies and direct client access. Serve exam questions without answer keys; keep scoring and answer-key access server-side. Replace unrestricted question/settings policies with checks for an active admin. Add tests for expired tokens, guessed session IDs, anonymous reads/writes, and unauthorized admin writes.

### Legal and privacy details are incomplete

The app collects candidate names, JAMB registration numbers, phone numbers, dates of birth, gender, state, optional email, subject choices, answers, and results. Guest invitations collect names and email addresses. Before publishing Terms and Privacy pages, specify the legal operator name, public privacy contact, retention/deletion periods and process, and how data for under-18 candidates is handled. Have the documents reviewed for the applicable Nigerian data-protection requirements. The trademark notice is not a substitute for these pages.

### Authentication and operational controls need decisions

- Registration currently attempts immediate sign-in and tells users to disable Supabase email confirmation if sign-in fails. Decide whether production requires email confirmation and implement/test the matching registration flow.
- Remove or disable `/admin/setup` and its creation endpoint after the first super-admin is provisioned. Use a strong one-time setup secret until then.
- Add abuse controls/rate limits to invite creation and guest endpoints; configure email sending and verify the sender domain/deliverability.

## Hosting configuration

Set these in Netlify's encrypted environment settings, not in source control:

- `NEXT_PUBLIC_SITE_URL`: canonical HTTPS production origin
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the current guest routes also read this name; consolidate the names before launch)
- `SUPABASE_SERVICE_ROLE_KEY`: server-only; never expose with a `NEXT_PUBLIC_` prefix
- `ADMIN_SETUP_KEY`: strong one-time value; remove the setup feature after bootstrap
- `GMAIL_USER` and `GMAIL_APP_PASSWORD`: server-only mail credentials

Also verify Supabase redirect/callback allowlists, production database migrations and RLS, Netlify build/deploy previews, custom-domain TLS, and end-to-end registration, invite, exam, results, and admin flows before opening the site publicly.

## Current verification

- `npm run build` passes.
- Full-project ESLint is not clean; it reports existing hook-order/effect issues in guest exam/results pages and additional `any`/JSX issues in dashboard/results. Resolve these before making lint a release gate.
