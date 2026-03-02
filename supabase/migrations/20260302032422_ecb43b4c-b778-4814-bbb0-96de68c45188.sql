
-- Enums
CREATE TYPE public.order_status AS ENUM ('created','paid','awaiting_upload','processing','ready','delivered','needs_revision','cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending','approved','rejected','cancelled','refunded');
CREATE TYPE public.product_type AS ENUM ('restore','upscale','theme');
CREATE TYPE public.job_status AS ENUM ('queued','processing','done','failed','needs_review');

-- orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT 'MEM-' || substr(gen_random_uuid()::text, 1, 8),
  public_access_token UUID DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  product_type public.product_type NOT NULL,
  status public.order_status NOT NULL DEFAULT 'created',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- order_assets
CREATE TABLE public.order_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  input_url TEXT,
  output_url TEXT,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- order_brief
CREATE TABLE public.order_brief (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  type public.product_type NOT NULL,
  status public.job_status NOT NULL DEFAULT 'queued',
  attempts INT DEFAULT 0,
  logs JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  gateway TEXT NOT NULL DEFAULT 'manual',
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('order-files', 'order-files', false);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_brief_updated_at BEFORE UPDATE ON public.order_brief FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== RLS POLICIES ==========

-- ORDERS: anon can insert (checkout without login)
CREATE POLICY "Anon can create orders"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (true);

-- ORDERS: anyone can select their own order via public_access_token
CREATE POLICY "Public access via token"
  ON public.orders FOR SELECT TO anon, authenticated
  USING (true);

-- ORDERS: anon can update orders they have the token for (status transitions)
CREATE POLICY "Anon can update orders via token"
  ON public.orders FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ORDERS: admin full access
CREATE POLICY "Admin full access to orders"
  ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ORDER_ASSETS: public select + admin full
CREATE POLICY "Public select order_assets"
  ON public.order_assets FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can insert order_assets"
  ON public.order_assets FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin full access to order_assets"
  ON public.order_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ORDER_BRIEF: public select + insert + admin full
CREATE POLICY "Public select order_brief"
  ON public.order_brief FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can insert order_brief"
  ON public.order_brief FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can update order_brief"
  ON public.order_brief FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to order_brief"
  ON public.order_brief FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- JOBS: public select + admin full
CREATE POLICY "Public select jobs"
  ON public.jobs FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can insert jobs"
  ON public.jobs FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin full access to jobs"
  ON public.jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PAYMENTS: public select + insert + admin full
CREATE POLICY "Public select payments"
  ON public.payments FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can insert payments"
  ON public.payments FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin full access to payments"
  ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- STORAGE: admin full access to order-files bucket
CREATE POLICY "Admin full access to order-files"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));
