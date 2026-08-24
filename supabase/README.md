# Supabase setup for HIRAYA

## 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (note your database password)

## 2. Run database migrations (SQL Editor)

Open **SQL Editor** and run each file in `supabase/migrations/` **in order**:

| Order | File |
|-------|------|
| 1 | `001_initial_schema.sql` |
| 2 | `002_profile_fields.sql` |
| 3 | `003_live_refresh_history.sql` |
| 4 | `004_user_refresh_history.sql` |

See `supabase/migrations/README.md` for details.

This creates:

- `profiles` — linked to `auth.users`, with JSON profile fields
- `assessment_records` — full prediction history (manual + **15-min live refresh**)
- Row Level Security policies
- Auto-profile trigger on sign-up

## 3. Copy API keys into env files

### Mobile (project root `.env`)

| Variable | Where to find it |
|----------|------------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public |
| `EXPO_PUBLIC_API_URL` | Your FastAPI backend URL (optional) |

### Backend (`backend/.env`)

| Variable | Where to find it |
|----------|------------------|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_JWT_SECRET` | Project Settings → API → JWT Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role (server only) |
| `DATABASE_URL` | Project Settings → Database → Connection string → URI |

Use the **Session pooler** connection string (port 6543) for the backend.

## 4. App code layout

Supabase client calls live under:

```
src/services/supabase/
  index.ts
  profileService.ts
  assessmentRecordsService.ts
  types.ts
```

- **Profiles** sync on save/load via `profileService.ts`
- **History** — every live refresh (15 min), user refresh, and manual assessment is inserted into `assessment_records` with `source` = `live_refresh`, `user_refresh`, or `manual_assessment`

## 5. Auth flow

- **Mobile** signs up / signs in via Supabase Auth (`@supabase/supabase-js`)
- **Backend** verifies the Supabase access token on every protected route
- **Profiles** are created automatically when a user registers

## 7. Public ML via Supabase Edge Functions (APK-friendly HTTPS)

Supabase cannot host the Python LightGBM server, so HIRAYA exposes a cloud scorer as Edge Functions:

| Function | URL path | Auth |
|----------|----------|------|
| `health` | `/functions/v1/health` | Public (anon key) |
| `predictions-heat-risk` | `/functions/v1/predictions-heat-risk` | User JWT |

Deploy (one-time):

```bash
npx supabase login
npx supabase functions deploy health --project-ref YOUR_PROJECT_REF --no-verify-jwt
npx supabase functions deploy predictions-heat-risk --project-ref YOUR_PROJECT_REF
```

Mobile `.env`:

```env
EXPO_PUBLIC_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1
EXPO_PUBLIC_ALLOW_CLEARTEXT=false
```

Then rebuild the APK so the URL is baked in.
