# Deploy checklist

## Vercel (frontend)

- Auto-deploys from `main`.
- Usually **no** `SUPABASE_*` vars needed on Vercel — the browser talks to `/api/*`, proxied to Render.

## Render (backend API)

Required environment variables:

| Variable | Where to get it |
|----------|-----------------|
| `MISTRAL_API_KEY` | [console.mistral.ai](https://console.mistral.ai) |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → **service_role** (secret) |

After adding or changing env vars: **Manual Deploy** or wait for auto-deploy from GitHub.

Verify:

```bash
curl https://kapsul.onrender.com/api/health
```

Expect:

```json
{
  "mistral": true,
  "supabase_configured": true,
  "library_db": true
}
```

If `supabase_configured` is `false`, add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` on Render.

If `library_db` is `false` but `supabase_configured` is `true`, run `supabase/library_grants.sql` in the Supabase SQL Editor.

## Supabase (database)

1. Run `supabase/library_schema.sql` (tables + grants), or only `supabase/library_grants.sql` if tables already exist.
