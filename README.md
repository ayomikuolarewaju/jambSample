# JAMB CBT Portal

A computer-based test simulator for Nigeria's JAMB university entrance exam, built to mirror the real exam experience for candidates preparing for it.

## What it does

Lets candidates sit a realistic, timed CBT-style practice exam either as a registered user with saved history, or as an invited guest with no account required.

## Features

- **Two parallel exam flows** — a full registered-candidate path with results history, and a separate invite-only guest path for candidates who just have a link and no account
- **Invite delivery** — guest exam links generated and sent by email via Nodemailer
- **Time-boxed guest access** — guest sessions are tied to expiring tokens rather than open-ended links
- **Row-level security** — Supabase RLS policies keep every candidate's results and session data scoped to them alone, across both flows
- **Versioned schema** — database structure managed through ordered Supabase migrations rather than manual changes

## Tech stack

- **Framework:** Next.js
- **Backend:** Supabase (Postgres, auth, RLS)
- **Email:** Nodemailer

## Architecture notes

- Supabase is accessed through separate server and client instances, kept deliberately apart so server-only operations (like guest token validation) never run with client-exposed credentials
- Guest sessions exist as their own table structure rather than being bolted onto the registered-candidate schema, since the two flows have genuinely different data and security needs

## Status

Personal build, in active development.