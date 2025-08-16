# Copilot Instructions for Migrate Mate Cancel Flow

## Architecture & Major Components
- **Frameworks:** Next.js (App Router), React (TypeScript), Tailwind CSS
- **Database:** Supabase (Postgres, RLS enabled), configured in `src/lib/supabase.ts`
- **API Routes:** Cancellation logic is handled via Next.js API routes in `src/app/api/cancel/*` and `src/app/api/subscription/cancel/route.ts`.
- **UI Flow:** Main cancellation UI is in `src/components/CancelFlowModal.tsx`, invoked from profile/cancel pages.
- **A/B Testing:** Variant assignment and persistence logic in `src/app/api/cancel/variant/route.ts` (server-side, cryptographically secure, sticky per user).

## Developer Workflows
- **Start Dev Server:** `npm run dev` (uses Turbopack)
- **DB Setup/Reset:**
  - `npm run db:setup` (starts Supabase, seeds schema/data)
  - `npm run db:reset` (resets Supabase db)
- **End-to-End Tests:** `npm run test:e2e` (Playwright)
- **Lint:** `npm run lint`

## Key Patterns & Conventions
- **Mock User:** Use hardcoded user ID/email for local dev (`USER_ID = "00000000-0000-0000-0000-000000000001"`). No real auth.
- **CSRF Protection:** API routes expect `CSRF-Token` header. See `/api/csrf` and modal logic for token handling.
- **Cancellation Data:** Persist cancellation actions to `cancellations` table. Variant, reason, and feedback are all stored.
- **A/B Downsell Logic:**
  - Only users selecting "Too expensive" are eligible for offer.
  - Variant B shows discounted price; A shows regular price.
  - Variant is sticky per user and never re-randomized.
- **Security:**
  - Row-Level Security (RLS) enforced in Supabase.
  - Input validation in API routes (see feedback/cancel endpoints).
  - No payment processing or real user auth (stubbed).

## Integration Points
- **Supabase:**
  - Admin client: `src/lib/supabaseAdmin.ts`
  - Browser client: `src/lib/supabaseBrowser.ts`
- **Database Schema:**
  - See `seed.sql` for initial tables. Expand `cancellations` table as needed for new fields.
- **API Communication:**
  - All cancellation flow actions (variant, apply-offer, confirm, feedback) are handled via fetch calls to API routes.

## Examples
- **CancelFlowModal:** Handles 3-step UI, variant logic, feedback, and confirmation. See `src/components/CancelFlowModal.tsx`.
- **API Route Example:** `src/app/api/cancel/variant/route.ts` for A/B logic and persistence.
- **DB Util Example:** `src/lib/db.ts` for mock feedback persistence.

## Out-of-Scope
- Payment processing, real authentication, email notifications, analytics (stubbed or omitted).

---

**For new agents:**
- Always follow the A/B logic and persist variant on first entry.
- Use the provided mock user for all local actions.
- Reference the README for challenge requirements and setup steps.
- Expand the database schema as needed to support new features.
