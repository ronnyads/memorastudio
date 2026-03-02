# MemoraStudio Security + AI Rollout

## Required secrets

Configure in Supabase Edge Functions:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default `gpt-image-1`)
- `LEGACY_ACCESS_CUTOFF_UTC` (UTC timestamp that ends legacy token window)
- `APP_BASE_URL` (public frontend URL)
- `WORKER_SECRET` (optional, recommended)

## Deployment order

1. Apply migration `20260302113000_security_hardening_and_ai_pipeline.sql`.
2. Deploy edge functions:
   - `create-order-simulated`
   - `request-order-login`
   - `get-order-portal-data`
   - `upload-order-input-url`
   - `finalize-order-upload`
   - `request-order-download-url`
   - `legacy-order-access`
   - `request-order-revision`
   - `process-jobs`
3. Deploy frontend.

## Post-deploy smoke checklist

1. Anonymous user cannot query `orders`, `order_assets`, `order_brief`, `jobs`, `payments`.
2. Checkout creates order via `create-order-simulated`.
3. OTP login email is sent by `request-order-login`.
4. Authenticated user can open only their own order in `/pedido/:id`.
5. Upload flow works:
   - `upload-order-input-url`
   - signed upload
   - `finalize-order-upload`
6. Worker `process-jobs` runs and writes `output_url`.
7. Download works only for `ready` or `delivered`.
8. Legacy token link only works for pre-cutoff orders before cutoff date.

## Rollback

1. Revert frontend commit.
2. Revert edge functions to prior stable versions.
3. If necessary, revert migration policies to admin-only temporary mode (never reopen public `USING (true)`).
