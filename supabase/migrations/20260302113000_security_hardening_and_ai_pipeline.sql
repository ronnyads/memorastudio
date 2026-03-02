-- Phase: security hardening + secure order portal foundations

-- Ensure RLS is active on operational tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_brief ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Remove permissive policies
DROP POLICY IF EXISTS "Anon can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public access via token" ON public.orders;
DROP POLICY IF EXISTS "Anon can update orders via token" ON public.orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;

DROP POLICY IF EXISTS "Public select order_assets" ON public.order_assets;
DROP POLICY IF EXISTS "Anon can insert order_assets" ON public.order_assets;
DROP POLICY IF EXISTS "Admin full access to order_assets" ON public.order_assets;

DROP POLICY IF EXISTS "Public select order_brief" ON public.order_brief;
DROP POLICY IF EXISTS "Anon can insert order_brief" ON public.order_brief;
DROP POLICY IF EXISTS "Anon can update order_brief" ON public.order_brief;
DROP POLICY IF EXISTS "Admin full access to order_brief" ON public.order_brief;

DROP POLICY IF EXISTS "Public select jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anon can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admin full access to jobs" ON public.jobs;

DROP POLICY IF EXISTS "Public select payments" ON public.payments;
DROP POLICY IF EXISTS "Anon can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admin full access to payments" ON public.payments;

-- Shared helper for ownership checks
CREATE OR REPLACE FUNCTION public.customer_owns_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = p_order_id
      AND lower(o.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Strict policies
CREATE POLICY "Admin full access to orders"
  ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customer can read own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

CREATE POLICY "Admin full access to order_assets"
  ON public.order_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customer can read own order assets"
  ON public.order_assets FOR SELECT TO authenticated
  USING (public.customer_owns_order(order_id));

CREATE POLICY "Admin full access to order_brief"
  ON public.order_brief FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customer can read own order brief"
  ON public.order_brief FOR SELECT TO authenticated
  USING (public.customer_owns_order(order_id));

CREATE POLICY "Admin full access to jobs"
  ON public.jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customer can read own jobs"
  ON public.jobs FOR SELECT TO authenticated
  USING (public.customer_owns_order(order_id));

CREATE POLICY "Admin full access to payments"
  ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customer can read own payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.customer_owns_order(order_id));

-- New operational tables
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idempotency_keys_scope_key_idx
  ON public.idempotency_keys(scope, key);

CREATE INDEX IF NOT EXISTS idempotency_keys_expires_at_idx
  ON public.idempotency_keys(expires_at);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Admin read idempotency keys"
  ON public.idempotency_keys FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.legacy_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_ip TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  reason TEXT
);

CREATE INDEX IF NOT EXISTS legacy_access_audit_order_id_idx
  ON public.legacy_access_audit(order_id);

ALTER TABLE public.legacy_access_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read legacy audit" ON public.legacy_access_audit;
CREATE POLICY "Admin read legacy audit"
  ON public.legacy_access_audit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Job runtime hardening columns
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS locked_by TEXT,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS jobs_status_next_retry_idx
  ON public.jobs(status, next_retry_at);

CREATE INDEX IF NOT EXISTS jobs_order_id_created_at_idx
  ON public.jobs(order_id, created_at DESC);

-- Secure job claiming for worker concurrency
CREATE OR REPLACE FUNCTION public.claim_jobs(p_limit INTEGER, p_worker TEXT)
RETURNS SETOF public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT j.id
    FROM public.jobs j
    WHERE (
      j.status = 'queued'
      OR (
        j.status = 'failed'
        AND coalesce(j.attempts, 0) < 3
        AND (j.next_retry_at IS NULL OR j.next_retry_at <= now())
      )
    )
    AND (
      j.locked_by IS NULL
      OR j.started_at IS NULL
      OR j.started_at < now() - interval '15 minutes'
    )
    ORDER BY j.created_at ASC
    LIMIT GREATEST(coalesce(p_limit, 1), 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.jobs j
  SET
    status = 'processing',
    locked_by = p_worker,
    started_at = now(),
    finished_at = NULL,
    last_error = NULL,
    attempts = coalesce(j.attempts, 0) + 1,
    updated_at = now()
  FROM candidates c
  WHERE j.id = c.id
  RETURNING j.*;
END;
$$;
